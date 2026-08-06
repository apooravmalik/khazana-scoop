import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCatalogCheckoutSession,
  markSupabaseCatalogOrderPaid,
  updateCatalogCheckoutSession,
  verifyRazorpaySignature,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
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

    const checkout = await getCatalogCheckoutSession(parsed.data.checkoutId);

    if (!checkout) {
      throw new ServiceError("Checkout session not found.", 404);
    }

    if (
      checkout.payment_status === "paid" &&
      checkout.razorpay_payment_id === parsed.data.razorpay_payment_id
    ) {
      return NextResponse.json({ orderId: checkout.supabase_order_id, success: true });
    }

    if (
      checkout.razorpay_order_id &&
      checkout.razorpay_order_id !== parsed.data.razorpay_order_id
    ) {
      throw new ServiceError("Payment order mismatch.", 400);
    }

    const validSignature = verifyRazorpaySignature({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    });

    if (!validSignature) {
      await updateCatalogCheckoutSession(checkout.id, {
        payment_status: "signature_failed",
        provider_payload: parsed.data,
        razorpay_payment_id: parsed.data.razorpay_payment_id,
        razorpay_signature: parsed.data.razorpay_signature,
      });

      throw new ServiceError("Razorpay signature verification failed.", 400);
    }

    if (checkout.supabase_order_id) {
      await markSupabaseCatalogOrderPaid(checkout.supabase_order_id);
    }

    const savedCheckout = await updateCatalogCheckoutSession(checkout.id, {
      payment_status: "paid",
      provider_payload: parsed.data,
      razorpay_order_id: parsed.data.razorpay_order_id,
      razorpay_payment_id: parsed.data.razorpay_payment_id,
      razorpay_signature: parsed.data.razorpay_signature,
    });

    return NextResponse.json({
      orderId: savedCheckout?.supabase_order_id,
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
