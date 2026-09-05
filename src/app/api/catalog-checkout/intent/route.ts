import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createCatalogCheckoutSession,
  createRazorpayOrder,
  createSupabaseCatalogOrder,
  getRazorpayConfig,
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
  let checkoutSessionCreated = false;

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
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: summary.totalPaise,
      receipt: `ks_${supabaseOrderId}_${Date.now()}`,
      supabaseOrderId,
    });

    const checkout = await createCatalogCheckoutSession({
      cartSnapshot: validatedItems.map((item) => ({
        name: item.product.name,
        pricePaise: item.effectivePricePaise,
        productId: item.product.id,
        quantity: item.quantity,
        slug: item.product.slug,
      })),
      currency: razorpayOrder.currency,
      contact,
      paymentStatus: "created",
      razorpayOrderId: razorpayOrder.id,
      shippingPaise: summary.shippingPaise,
      subtotalPaise: summary.subtotalPaise,
      supabaseOrderId,
      totalPaise: summary.totalPaise,
    });
    checkoutSessionCreated = true;

    return NextResponse.json({
      checkoutId: checkout.id,
      razorpayKeyId: getRazorpayConfig().keyId,
      razorpayOrderId: razorpayOrder.id,
      supabaseOrderId,
    });
  } catch (error) {
    console.error("Razorpay checkout intent failed", error);

    if (supabaseOrderId && validatedItems && !checkoutSessionCreated) {
      try {
        await rollbackSupabaseCatalogOrder(supabaseOrderId, validatedItems);
      } catch (rollbackError) {
        console.error("Razorpay checkout rollback failed", rollbackError);
      }
    }

    return jsonError(error);
  }
}
