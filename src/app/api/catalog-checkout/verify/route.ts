import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchRazorpayPayment,
  getCatalogCheckoutSessionByRazorpayOrderId,
  markSupabaseCatalogOrderPaid,
  updateCatalogCheckoutSession,
  verifyRazorpayPaymentSignature,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { requireDatabase, ServiceError } from "@/lib/production-store";

const catalogCheckoutVerifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = catalogCheckoutVerifySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Razorpay payment details." }, { status: 400 });
  }

  try {
    requireDatabase();
    const checkout = await getCatalogCheckoutSessionByRazorpayOrderId(parsed.data.razorpayOrderId);

    if (!checkout) {
      throw new ServiceError("Checkout session not found.", 404);
    }

    if (!verifyRazorpayPaymentSignature(parsed.data)) {
      throw new ServiceError("Invalid Razorpay payment signature.", 400);
    }

    const payment = await fetchRazorpayPayment(parsed.data.razorpayPaymentId);

    if (
      payment.order_id !== checkout.razorpay_order_id ||
      payment.amount !== checkout.total_paise ||
      payment.currency !== checkout.currency
    ) {
      throw new ServiceError("Razorpay payment details do not match this checkout.", 400);
    }

    const paid = payment.status === "captured";

    if (paid && checkout.supabase_order_id) {
      await markSupabaseCatalogOrderPaid(checkout.supabase_order_id);
    }

    const savedCheckout = await updateCatalogCheckoutSession(checkout.id, {
      payment_status: paid ? "paid" : payment.status,
      provider_payload: { razorpayPayment: payment, razorpaySignature: parsed.data.razorpaySignature },
      razorpay_payment_id: payment.id,
    });

    return NextResponse.json({
      orderId: savedCheckout?.supabase_order_id,
      paymentStatus: payment.status,
      success: paid,
    });
  } catch (error) {
    return jsonError(error);
  }
}
