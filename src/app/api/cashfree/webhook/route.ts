import { NextResponse } from "next/server";
import {
  fetchCashfreeOrder,
  getCatalogCheckoutSessionByCashfreeOrderId,
  markSupabaseCatalogOrderPaid,
  updateCatalogCheckoutSession,
  verifyCashfreeWebhookSignature,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { ServiceError } from "@/lib/production-store";

type CashfreeWebhookEvent = {
  data?: {
    order?: {
      order_amount?: number;
      order_currency?: string;
      order_id?: string;
    };
    payment?: {
      cf_payment_id?: string;
      payment_status?: string;
    };
  };
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-webhook-signature");
    const timestamp = request.headers.get("x-webhook-timestamp");

    if (!payload || !signature || !timestamp) {
      throw new ServiceError("Missing Cashfree webhook payload or signature headers.", 400);
    }

    if (!verifyCashfreeWebhookSignature({ payload, signature, timestamp })) {
      throw new ServiceError("Invalid Cashfree webhook signature.", 400);
    }

    let event: CashfreeWebhookEvent;

    try {
      event = JSON.parse(payload) as CashfreeWebhookEvent;
    } catch {
      throw new ServiceError("Invalid Cashfree webhook payload.", 400);
    }

    const cashfreeOrderId = event.data?.order?.order_id;
    const payment = event.data?.payment;

    if (!cashfreeOrderId || !payment?.cf_payment_id) {
      return NextResponse.json({ received: true });
    }

    const checkout = await getCatalogCheckoutSessionByCashfreeOrderId(cashfreeOrderId);

    if (!checkout) {
      return NextResponse.json({ received: true });
    }

    const cashfreeOrder = await fetchCashfreeOrder(cashfreeOrderId);

    if (
      cashfreeOrder.order_id !== checkout.cashfree_order_id ||
      Math.round(cashfreeOrder.order_amount * 100) !== checkout.total_paise ||
      cashfreeOrder.order_currency !== checkout.currency
    ) {
      throw new ServiceError("Webhook order details do not match this checkout.", 400);
    }

    const paid = cashfreeOrder.order_status === "PAID";

    if (paid && checkout.supabase_order_id) {
      await markSupabaseCatalogOrderPaid(checkout.supabase_order_id);
    }

    if (paid || checkout.payment_status !== "paid") {
      await updateCatalogCheckoutSession(checkout.id, {
        cashfree_payment_id: payment.cf_payment_id,
        payment_status: paid ? "paid" : payment.payment_status?.toLowerCase() ?? "pending",
        provider_payload: event,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
