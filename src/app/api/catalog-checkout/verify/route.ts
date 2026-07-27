import { NextResponse } from "next/server";
import { z } from "zod";
import { markSupabaseCatalogOrderPaid, verifyRazorpaySignature } from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { getPrisma } from "@/lib/clients";
import { requireDatabase, ServiceError } from "@/lib/production-store";

const catalogCheckoutVerifySchema = z.object({
  checkoutId: z.string().trim().min(1),
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = catalogCheckoutVerifySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });
  }

  try {
    requireDatabase();

    const checkout = await getPrisma().catalogCheckout.findUnique({
      where: { id: parsed.data.checkoutId },
    });

    if (!checkout) {
      throw new ServiceError("Checkout session not found.", 404);
    }

    if (
      checkout.paymentStatus === "paid" &&
      checkout.razorpayPaymentId === parsed.data.razorpay_payment_id
    ) {
      return NextResponse.json({ orderId: checkout.supabaseOrderId, success: true });
    }

    if (
      checkout.razorpayOrderId &&
      checkout.razorpayOrderId !== parsed.data.razorpay_order_id
    ) {
      throw new ServiceError("Payment order mismatch.", 400);
    }

    const validSignature = verifyRazorpaySignature({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    });

    if (!validSignature) {
      await getPrisma().catalogCheckout.update({
        where: { id: checkout.id },
        data: {
          paymentStatus: "signature_failed",
          providerPayload: parsed.data,
          razorpayPaymentId: parsed.data.razorpay_payment_id,
          razorpaySignature: parsed.data.razorpay_signature,
        },
      });

      throw new ServiceError("Razorpay signature verification failed.", 400);
    }

    if (checkout.supabaseOrderId) {
      await markSupabaseCatalogOrderPaid(checkout.supabaseOrderId);
    }

    const savedCheckout = await getPrisma().catalogCheckout.update({
      where: { id: checkout.id },
      data: {
        paymentStatus: "paid",
        providerPayload: parsed.data,
        razorpayOrderId: parsed.data.razorpay_order_id,
        razorpayPaymentId: parsed.data.razorpay_payment_id,
        razorpaySignature: parsed.data.razorpay_signature,
      },
    });

    return NextResponse.json({
      orderId: savedCheckout.supabaseOrderId,
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
