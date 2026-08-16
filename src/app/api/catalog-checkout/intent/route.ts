import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createCashfreeOrder,
  createCatalogCheckoutSession,
  createSupabaseCatalogOrder,
  rollbackSupabaseCatalogOrder,
  summarizeCatalogCheckout,
  validateCatalogCheckoutItems,
  type CatalogCheckoutContact,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { requireDatabase } from "@/lib/production-store";

const catalogCheckoutIntentSchema = z.object({
  customerAddressLine: z.string().trim().min(5),
  customerCity: z.string().trim().min(2),
  customerEmail: z.email(),
  customerLandmark: z.string().trim().max(160).optional().default(""),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(6),
  customerPincode: z.string().trim().regex(/^\d{6}$/),
  customerState: z.string().trim().min(2),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(10),
        slug: z.string().trim().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = catalogCheckoutIntentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  let validatedItems: Awaited<ReturnType<typeof validateCatalogCheckoutItems>> | null = null;
  let supabaseOrderId: number | null = null;
  let cashfreeOrderCreated = false;

  try {
    requireDatabase();

    const contact: CatalogCheckoutContact = {
      customerAddressLine: parsed.data.customerAddressLine,
      customerCity: parsed.data.customerCity,
      customerEmail: parsed.data.customerEmail,
      customerLandmark: parsed.data.customerLandmark,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerPincode: parsed.data.customerPincode,
      customerState: parsed.data.customerState,
    };
    validatedItems = await validateCatalogCheckoutItems(parsed.data.items);
    const summary = summarizeCatalogCheckout(validatedItems);
    supabaseOrderId = await createSupabaseCatalogOrder(validatedItems, contact);
    const cashfreeOrderId = `ks-${supabaseOrderId}-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const cashfreeOrder = await createCashfreeOrder({
      amountPaise: summary.totalPaise,
      cashfreeOrderId,
      contact,
      supabaseOrderId,
      returnUrl: `${appUrl}/checkout?cashfree_order_id=${encodeURIComponent(cashfreeOrderId)}`,
    });
    cashfreeOrderCreated = true;

    const checkout = await createCatalogCheckoutSession({
      cartSnapshot: validatedItems.map((item) => ({
        name: item.product.name,
        pricePaise: item.effectivePricePaise,
        productId: item.product.id,
        quantity: item.quantity,
        slug: item.product.slug,
      })),
      currency: cashfreeOrder.order_currency,
      contact,
      paymentStatus: "created",
      cashfreeOrderId: cashfreeOrder.order_id,
      shippingPaise: summary.shippingPaise,
      subtotalPaise: summary.subtotalPaise,
      supabaseOrderId,
      totalPaise: summary.totalPaise,
    });

    return NextResponse.json({
      cashfreeOrderId: cashfreeOrder.order_id,
      checkoutId: checkout.id,
      environment: process.env.CASHFREE_ENVIRONMENT ?? "sandbox",
      paymentSessionId: cashfreeOrder.payment_session_id,
      supabaseOrderId,
    });
  } catch (error) {
    console.error("Cashfree checkout intent failed", error);

    if (supabaseOrderId && validatedItems && !cashfreeOrderCreated) {
      try {
        await rollbackSupabaseCatalogOrder(supabaseOrderId, validatedItems);
      } catch (rollbackError) {
        console.error("Cashfree checkout rollback failed", rollbackError);
      }
    }

    return jsonError(error);
  }
}
