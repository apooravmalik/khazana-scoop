import { NextResponse } from "next/server";
import { z } from "zod";
import { getStorefrontCatalogProductBySlug } from "@/lib/catalog";

const createCatalogOrderSchema = z.object({
  customerAddress: z.string().trim().min(10),
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(6),
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  slug: z.string().trim().min(1),
});

type RestOrderInsert = {
  id: number;
};

type RestProductRow = {
  id: number;
  name: string;
  slug: string | null;
  stock_quantity: number;
  unit_cost: number;
};

function getSupabaseRestConfig(): { key: string; url: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase REST access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a write-capable Supabase key.",
    );
  }

  return { key, url };
}

async function restRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const config = getSupabaseRestConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase REST request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

async function selectSingleProduct(productId: number): Promise<RestProductRow | null> {
  const rows = await restRequest<RestProductRow[]>(
    `products?select=id,name,slug,stock_quantity,unit_cost&id=eq.${productId}&limit=1`,
    { method: "GET" },
  );

  return rows[0] ?? null;
}

async function deleteWhere(table: string, filter: string): Promise<void> {
  await restRequest<unknown>(`${table}?${filter}`, { method: "DELETE" });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = createCatalogOrderSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid catalog order payload." }, { status: 400 });
    }

    const payload = parsed.data;
    const [liveProduct, productRow] = await Promise.all([
      getStorefrontCatalogProductBySlug(payload.slug),
      selectSingleProduct(payload.productId),
    ]);

    if (
      !liveProduct ||
      liveProduct.id !== payload.productId ||
      liveProduct.effectivePrice === null ||
      !productRow
    ) {
      return NextResponse.json({ error: "That product is not available for ordering." }, { status: 400 });
    }

    if (productRow.stock_quantity < payload.quantity) {
      return NextResponse.json({ error: "There is not enough stock left for that quantity." }, { status: 409 });
    }

    const orderedAt = new Date().toISOString().slice(0, 10);
    const unitSellingPrice = liveProduct.effectivePrice;
    const scoopPrice = unitSellingPrice * payload.quantity;
    const productCost = Number(productRow.unit_cost) * payload.quantity;
    const netProfit = scoopPrice - productCost;

    const insertedOrders = await restRequest<RestOrderInsert[]>("orders", {
      method: "POST",
      body: JSON.stringify([
        {
          customer_name: payload.customerName,
          customer_phone: payload.customerPhone,
          customer_address: payload.customerAddress,
          scoop_type_id: null,
          scoop_name_snapshot: liveProduct.name,
          scoop_price: scoopPrice,
          gift_count: payload.quantity,
          product_cost: productCost,
          delivery_cost: null,
          packaging_cost: null,
          net_profit: netProfit,
          delivery_status: "pending",
          payment_status: "unpaid",
          order_source: "website",
          ordered_at: orderedAt,
          delivery_date: null,
        },
      ]),
    });

    const createdOrder = insertedOrders[0];

    if (!createdOrder) {
      return NextResponse.json({ error: "The order could not be created." }, { status: 500 });
    }

    try {
      await restRequest<unknown>("order_items", {
        method: "POST",
        body: JSON.stringify([
          {
            order_id: createdOrder.id,
            product_id: productRow.id,
            product_name_snapshot: productRow.name,
            quantity: payload.quantity,
            unit_cost_snapshot: productRow.unit_cost,
            line_cost: productCost,
          },
        ]),
      });

      await restRequest<RestProductRow[]>(
        `products?id=eq.${productRow.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            stock_quantity: productRow.stock_quantity - payload.quantity,
            updated_at: new Date().toISOString(),
          }),
        },
      );

      await restRequest<unknown>("stock_movements", {
        method: "POST",
        body: JSON.stringify([
          {
            product_id: productRow.id,
            quantity_delta: payload.quantity * -1,
            reason: `Order #${createdOrder.id}`,
            note: `Catalog checkout for ${payload.customerName}`,
            unit_cost_snapshot: productRow.unit_cost,
            movement_value: productCost,
          },
        ]),
      });
    } catch (error) {
      await restRequest<RestProductRow[]>(
        `products?id=eq.${productRow.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            stock_quantity: productRow.stock_quantity,
            updated_at: new Date().toISOString(),
          }),
        },
      ).catch(() => undefined);
      await deleteWhere("order_items", `order_id=eq.${createdOrder.id}`).catch(() => undefined);
      await deleteWhere("orders", `id=eq.${createdOrder.id}`).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ orderId: createdOrder.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error while creating the catalog order.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
