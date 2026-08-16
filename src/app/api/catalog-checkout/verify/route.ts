import { NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchCashfreeOrder,
  fetchCashfreePayments,
  getCatalogCheckoutSessionByCashfreeOrderId,
  markSupabaseCatalogOrderPaid,
  updateCatalogCheckoutSession,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { requireDatabase, ServiceError } from "@/lib/production-store";

const catalogCheckoutVerifySchema = z.object({
  cashfreeOrderId: z.string().trim().min(1),
});

export async function GET(request: Request): Promise<NextResponse> {
  const parsed = catalogCheckoutVerifySchema.safeParse({
    cashfreeOrderId: new URL(request.url).searchParams.get("cashfreeOrderId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Cashfree order id." }, { status: 400 });
  }

  try {
    requireDatabase();

    const checkout = await getCatalogCheckoutSessionByCashfreeOrderId(parsed.data.cashfreeOrderId);

    if (!checkout) {
      throw new ServiceError("Checkout session not found.", 404);
    }

    const cashfreeOrder = await fetchCashfreeOrder(parsed.data.cashfreeOrderId);

    if (
      cashfreeOrder.order_id !== checkout.cashfree_order_id ||
      Math.round(cashfreeOrder.order_amount * 100) !== checkout.total_paise ||
      cashfreeOrder.order_currency !== checkout.currency
    ) {
      throw new ServiceError("Cashfree order details do not match this checkout.", 400);
    }

    const paid = cashfreeOrder.order_status === "PAID";
    const successfulPayment = paid
      ? (await fetchCashfreePayments(parsed.data.cashfreeOrderId)).find(
          (payment) => payment.payment_status === "SUCCESS",
        )
      : undefined;

    if (paid && checkout.supabase_order_id) {
      await markSupabaseCatalogOrderPaid(checkout.supabase_order_id);
    }

    const savedCheckout = await updateCatalogCheckoutSession(checkout.id, {
      cashfree_payment_id: successfulPayment?.cf_payment_id ?? checkout.cashfree_payment_id,
      payment_status: paid ? "paid" : cashfreeOrder.order_status.toLowerCase(),
      provider_payload: { cashfreeOrder },
    });

    return NextResponse.json({
      orderId: savedCheckout?.supabase_order_id,
      paymentStatus: cashfreeOrder.order_status,
      success: paid,
    });
  } catch (error) {
    return jsonError(error);
  }
}
