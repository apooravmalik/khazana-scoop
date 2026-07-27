import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createRazorpayOrder,
  createSupabaseCatalogOrder,
  summarizeCatalogCheckout,
  validateCatalogCheckoutItems,
  type CatalogCheckoutContact,
} from "@/lib/catalog-checkout";
import { jsonError } from "@/lib/api-utils";
import { getPrisma } from "@/lib/clients";
import { requireDatabase } from "@/lib/production-store";

const catalogCheckoutIntentSchema = z.object({
  customerAddress: z.string().trim().min(10),
  customerEmail: z.email(),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(6),
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

  try {
    requireDatabase();

    const contact: CatalogCheckoutContact = {
      customerAddress: parsed.data.customerAddress,
      customerEmail: parsed.data.customerEmail,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
    };
    const validatedItems = await validateCatalogCheckoutItems(parsed.data.items);
    const summary = summarizeCatalogCheckout(validatedItems);
    const supabaseOrderId = await createSupabaseCatalogOrder(validatedItems, contact);
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: summary.totalPaise,
      contact,
      receipt: `ks-${supabaseOrderId}-${Date.now()}`,
      supabaseOrderId,
    });

    const checkout = await getPrisma().catalogCheckout.create({
      data: {
        supabaseOrderId,
        customerName: contact.customerName,
        customerEmail: contact.customerEmail,
        customerPhone: contact.customerPhone,
        customerAddress: contact.customerAddress,
        cartSnapshot: validatedItems.map((item) => ({
          name: item.product.name,
          pricePaise: item.effectivePricePaise,
          productId: item.product.id,
          quantity: item.quantity,
          slug: item.product.slug,
        })),
        subtotalPaise: summary.subtotalPaise,
        shippingPaise: summary.shippingPaise,
        totalPaise: summary.totalPaise,
        currency: razorpayOrder.currency,
        paymentStatus: "created",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      amountPaise: summary.totalPaise,
      checkoutId: checkout.id,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      supabaseOrderId,
    });
  } catch (error) {
    return jsonError(error);
  }
}
