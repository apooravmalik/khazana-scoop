import { NextResponse } from "next/server";
import {
  fetchRazorpayPayment,
  getCatalogCheckoutSessionByRazorpayOrderId,
  markSupabaseCatalogOrderPaid,
  updateCatalogCheckoutSession,
  verifyRazorpayWebhookSignature,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { ServiceError } from "@/lib/production-store";

type RazorpayWebhookEvent = {
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!payload || !signature) {
      throw new ServiceError("Missing Razorpay webhook payload or signature header.", 400);
    }

    if (!verifyRazorpayWebhookSignature({ payload, signature })) {
      throw new ServiceError("Invalid Razorpay webhook signature.", 400);
    }

    let event: RazorpayWebhookEvent;

    try {
      event = JSON.parse(payload) as RazorpayWebhookEvent;
    } catch {
      throw new ServiceError("Invalid Razorpay webhook payload.", 400);
    }

    const razorpayOrderId = event.payload?.payment?.entity?.order_id;
    const razorpayPaymentId = event.payload?.payment?.entity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ received: true });
    }

    const checkout = await getCatalogCheckoutSessionByRazorpayOrderId(razorpayOrderId);

    if (!checkout) {
      return NextResponse.json({ received: true });
    }

    const payment = await fetchRazorpayPayment(razorpayPaymentId);

    if (
      payment.order_id !== checkout.razorpay_order_id ||
      payment.amount !== checkout.total_paise ||
      payment.currency !== checkout.currency
    ) {
      throw new ServiceError("Webhook payment details do not match this checkout.", 400);
    }

    const paid = payment.status === "captured";

    if (paid && checkout.supabase_order_id) {
      await markSupabaseCatalogOrderPaid(checkout.supabase_order_id);
    }

    if (paid || checkout.payment_status !== "paid") {
      await updateCatalogCheckoutSession(checkout.id, {
        payment_status: paid ? "paid" : payment.status,
        provider_payload: event,
        razorpay_payment_id: payment.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
