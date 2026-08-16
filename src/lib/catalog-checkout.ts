import crypto from "node:crypto";
import { ServiceError } from "@/lib/production-store";
import { getStorefrontCatalogProducts } from "@/lib/catalog";
import type { CatalogCartItem } from "@/lib/catalog-cart";
import { calculateCatalogShippingPaise } from "@/lib/catalog-pricing";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

type SupabaseCatalogProductRow = {
  id: number;
  name: string;
  slug: string | null;
  stock_quantity: number;
  unit_cost: number;
};

export type CatalogCheckoutSessionRow = {
  id: string;
  supabase_order_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
  customer_landmark: string | null;
  cart_snapshot: unknown;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  currency: string;
  cashfree_order_id: string | null;
  cashfree_payment_id: string | null;
  payment_status: string;
  provider_payload: unknown;
  created_at: string;
  updated_at: string;
};

export type CatalogCheckoutContact = {
  customerAddressLine: string;
  customerCity: string;
  customerEmail: string;
  customerLandmark?: string;
  customerName: string;
  customerPhone: string;
  customerPincode: string;
  customerState: string;
};

export type ValidatedCatalogCheckoutItem = {
  effectivePricePaise: number;
  lineTotalPaise: number;
  product: StorefrontCatalogProduct;
  productRow: SupabaseCatalogProductRow;
  quantity: number;
};

export type CatalogCheckoutSummary = {
  items: ValidatedCatalogCheckoutItem[];
  shippingPaise: number;
  subtotalPaise: number;
  totalPaise: number;
};

export type CashfreeOrder = {
  cf_order_id: string;
  order_amount: number;
  order_currency: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
};

export type CashfreePayment = {
  cf_payment_id: string;
  payment_status: string;
};

export function formatCatalogDeliveryAddress(contact: CatalogCheckoutContact): string {
  return [
    contact.customerAddressLine,
    contact.customerLandmark ? `Landmark: ${contact.customerLandmark}` : null,
    `${contact.customerCity}, ${contact.customerState} - ${contact.customerPincode}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

type InsertedSupabaseOrder = {
  id: number;
};

function getSupabaseRestConfig(): { key: string; url: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new ServiceError(
      "Supabase REST access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a write-capable Supabase key.",
      503,
    );
  }

  return { key, url };
}

async function restRequest<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new ServiceError(`Supabase REST request failed: ${response.status} ${message}`, 502);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

function buildInFilter(ids: number[]): string {
  return `(${ids.join(",")})`;
}

async function selectSupabaseProducts(productIds: number[]): Promise<SupabaseCatalogProductRow[]> {
  if (productIds.length === 0) {
    return [];
  }

  return restRequest<SupabaseCatalogProductRow[]>(
    `products?select=id,name,slug,stock_quantity,unit_cost&id=in.${buildInFilter(productIds)}`,
    { method: "GET" },
  );
}

function toPaise(value: number): number {
  return Math.round(value * 100);
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}

export async function validateCatalogCheckoutItems(
  items: CatalogCartItem[],
): Promise<ValidatedCatalogCheckoutItem[]> {
  if (items.length === 0) {
    throw new ServiceError("Your cart is empty.", 400);
  }

  const liveProducts = await getStorefrontCatalogProducts();
  const liveProductsById = new Map(liveProducts.map((product) => [product.id, product]));
  const productRows = await selectSupabaseProducts(items.map((item) => item.productId));
  const productRowsById = new Map(productRows.map((product) => [Number(product.id), product]));

  return items.map((item) => {
    const product = liveProductsById.get(item.productId);
    const productRow = productRowsById.get(item.productId);

    if (!product || !productRow || product.slug !== item.slug) {
      throw new ServiceError("One or more cart items are no longer available.", 404);
    }

    if (product.effectivePrice === null) {
      throw new ServiceError(`"${product.name}" cannot be purchased right now.`, 400);
    }

    if (product.stockQuantity < item.quantity || productRow.stock_quantity < item.quantity) {
      throw new ServiceError(`"${product.name}" does not have enough stock for that quantity.`, 409);
    }

    const effectivePricePaise = toPaise(product.effectivePrice);

    return {
      product,
      productRow,
      quantity: item.quantity,
      effectivePricePaise,
      lineTotalPaise: effectivePricePaise * item.quantity,
    };
  });
}

export function summarizeCatalogCheckout(
  items: ValidatedCatalogCheckoutItem[],
): CatalogCheckoutSummary {
  const subtotalPaise = sum(items, (item) => item.lineTotalPaise);
  const shippingPaise = calculateCatalogShippingPaise(subtotalPaise);

  return {
    items,
    subtotalPaise,
    shippingPaise,
    totalPaise: subtotalPaise + shippingPaise,
  };
}

async function insertSupabaseOrder(payload: Record<string, unknown>): Promise<InsertedSupabaseOrder> {
  try {
    const rows = await restRequest<InsertedSupabaseOrder[]>("orders", {
      method: "POST",
      body: JSON.stringify([{ ...payload, order_source: "website_cashfree" }]),
    });

    if (!rows[0]) {
      throw new ServiceError("The order could not be created.", 500);
    }

    return rows[0];
  } catch (error) {
    if (!(error instanceof ServiceError) || !error.message.includes("order_source")) {
      throw error;
    }

    const rows = await restRequest<InsertedSupabaseOrder[]>("orders", {
      method: "POST",
      body: JSON.stringify([payload]),
    });

    if (!rows[0]) {
      throw new ServiceError("The order could not be created.", 500);
    }

    return rows[0];
  }
}

async function deleteWhere(table: string, filter: string): Promise<void> {
  await restRequest<unknown>(`${table}?${filter}`, { method: "DELETE" });
}

export async function createCatalogCheckoutSession(payload: {
  cartSnapshot: unknown;
  currency: string;
  contact: CatalogCheckoutContact;
  paymentStatus: string;
  cashfreeOrderId: string | null;
  shippingPaise: number;
  subtotalPaise: number;
  supabaseOrderId: number | null;
  totalPaise: number;
}): Promise<CatalogCheckoutSessionRow> {
  const rows = await restRequest<CatalogCheckoutSessionRow[]>("catalog_checkout_sessions", {
    method: "POST",
    body: JSON.stringify([
      {
        cart_snapshot: payload.cartSnapshot,
        currency: payload.currency,
        customer_address: formatCatalogDeliveryAddress(payload.contact),
        customer_city: payload.contact.customerCity,
        customer_email: payload.contact.customerEmail,
        customer_landmark: payload.contact.customerLandmark?.trim() || null,
        customer_name: payload.contact.customerName,
        customer_phone: payload.contact.customerPhone,
        customer_pincode: payload.contact.customerPincode,
        customer_state: payload.contact.customerState,
        payment_status: payload.paymentStatus,
        cashfree_order_id: payload.cashfreeOrderId,
        shipping_paise: payload.shippingPaise,
        subtotal_paise: payload.subtotalPaise,
        supabase_order_id: payload.supabaseOrderId,
        total_paise: payload.totalPaise,
      },
    ]),
  });

  if (!rows[0]) {
    throw new ServiceError("The checkout session could not be created.", 500);
  }

  return rows[0];
}

export async function getCatalogCheckoutSession(checkoutId: string): Promise<CatalogCheckoutSessionRow | null> {
  try {
    const rows = await restRequest<CatalogCheckoutSessionRow[]>(
      `catalog_checkout_sessions?select=*&id=eq.${checkoutId}&limit=1`,
      { method: "GET" },
    );

    return rows[0] ?? null;
  } catch (error) {
    if (
      error instanceof ServiceError &&
      error.message.includes("invalid input syntax for type uuid")
    ) {
      return null;
    }

    throw error;
  }
}

export async function getCatalogCheckoutSessionByCashfreeOrderId(
  cashfreeOrderId: string,
): Promise<CatalogCheckoutSessionRow | null> {
  const rows = await restRequest<CatalogCheckoutSessionRow[]>(
    `catalog_checkout_sessions?select=*&cashfree_order_id=eq.${encodeURIComponent(cashfreeOrderId)}&limit=1`,
    { method: "GET" },
  );

  return rows[0] ?? null;
}

export async function updateCatalogCheckoutSession(
  checkoutId: string,
  payload: Record<string, unknown>,
): Promise<CatalogCheckoutSessionRow | null> {
  const rows = await restRequest<CatalogCheckoutSessionRow[]>(
    `catalog_checkout_sessions?id=eq.${checkoutId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...payload,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return rows[0] ?? null;
}

export async function createSupabaseCatalogOrder(
  items: ValidatedCatalogCheckoutItem[],
  contact: CatalogCheckoutContact,
): Promise<number> {
  const summary = summarizeCatalogCheckout(items);
  const orderedAt = new Date().toISOString().slice(0, 10);
  const totalQuantity = sum(items, (item) => item.quantity);
  const productCostPaise = sum(items, (item) => toPaise(Number(item.productRow.unit_cost)) * item.quantity);
  const totalPriceRupees = summary.totalPaise / 100;
  const productCostRupees = productCostPaise / 100;
  const lineLabel =
    items.length === 1
      ? items[0]?.product.name ?? "Catalog order"
      : `${items.length} catalog items`;

  const createdOrder = await insertSupabaseOrder({
    customer_name: contact.customerName,
    customer_phone: contact.customerPhone,
    customer_address: formatCatalogDeliveryAddress(contact),
    scoop_type_id: null,
    scoop_name_snapshot: lineLabel,
    scoop_price: totalPriceRupees,
    gift_count: totalQuantity,
    product_cost: productCostRupees,
    delivery_cost: null,
    packaging_cost: null,
    net_profit: totalPriceRupees - productCostRupees,
    delivery_status: "pending",
    payment_status: "unpaid",
    ordered_at: orderedAt,
    delivery_date: null,
  });

  try {
    await restRequest<unknown>("order_items", {
      method: "POST",
      body: JSON.stringify(
        items.map((item) => ({
          order_id: createdOrder.id,
          product_id: item.productRow.id,
          product_name_snapshot: item.product.name,
          quantity: item.quantity,
          unit_cost_snapshot: item.productRow.unit_cost,
          line_cost: (toPaise(Number(item.productRow.unit_cost)) * item.quantity) / 100,
        })),
      ),
    });

    await Promise.all(
      items.map((item) =>
        restRequest<SupabaseCatalogProductRow[]>(
          `products?id=eq.${item.productRow.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              stock_quantity: item.productRow.stock_quantity - item.quantity,
              updated_at: new Date().toISOString(),
            }),
          },
        ),
      ),
    );

    await restRequest<unknown>("stock_movements", {
      method: "POST",
      body: JSON.stringify(
        items.map((item) => ({
          product_id: item.productRow.id,
          quantity_delta: item.quantity * -1,
          reason: `Order #${createdOrder.id}`,
          note: `Website guest checkout for ${contact.customerName}`,
          unit_cost_snapshot: item.productRow.unit_cost,
          movement_value: (toPaise(Number(item.productRow.unit_cost)) * item.quantity) / 100,
        })),
      ),
    });
  } catch (error) {
    await Promise.all(
      items.map((item) =>
        restRequest<SupabaseCatalogProductRow[]>(
          `products?id=eq.${item.productRow.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              stock_quantity: item.productRow.stock_quantity,
              updated_at: new Date().toISOString(),
            }),
          },
        ).catch(() => undefined),
      ),
    );
    await deleteWhere("order_items", `order_id=eq.${createdOrder.id}`).catch(() => undefined);
    await deleteWhere("orders", `id=eq.${createdOrder.id}`).catch(() => undefined);
    throw error;
  }

  return createdOrder.id;
}

export async function rollbackSupabaseCatalogOrder(
  orderId: number,
  items: ValidatedCatalogCheckoutItem[],
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      restRequest<SupabaseCatalogProductRow[]>(
        `products?id=eq.${item.productRow.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            stock_quantity: item.productRow.stock_quantity,
            updated_at: new Date().toISOString(),
          }),
        },
      ),
    ),
  );

  await Promise.all([
    deleteWhere("order_items", `order_id=eq.${orderId}`),
    deleteWhere("stock_movements", `reason=eq.${encodeURIComponent(`Order #${orderId}`)}`),
  ]);
  await deleteWhere("orders", `id=eq.${orderId}`);
}

export async function markSupabaseCatalogOrderPaid(orderId: number): Promise<void> {
  await restRequest<unknown>(`orders?id=eq.${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({
      payment_status: "paid",
    }),
  });
}

export function getCashfreeConfig(): {
  apiVersion: string;
  appId: string;
  environment: "production" | "sandbox";
  secretKey: string;
} {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const configuredEnvironment = process.env.CASHFREE_ENVIRONMENT ?? "sandbox";

  if (!appId || !secretKey) {
    throw new ServiceError(
      "Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY before accepting payments.",
      503,
    );
  }

  if (configuredEnvironment !== "sandbox" && configuredEnvironment !== "production") {
    throw new ServiceError("CASHFREE_ENVIRONMENT must be either sandbox or production.", 503);
  }

  return {
    apiVersion: process.env.CASHFREE_API_VERSION ?? "2025-01-01",
    appId,
    environment: configuredEnvironment,
    secretKey,
  };
}

function getCashfreeBaseUrl(environment: "production" | "sandbox"): string {
  return environment === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
}

function getCashfreeHeaders(config: ReturnType<typeof getCashfreeConfig>): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-api-version": config.apiVersion,
    "x-client-id": config.appId,
    "x-client-secret": config.secretKey,
  };
}

export async function createCashfreeOrder(params: {
  amountPaise: number;
  cashfreeOrderId: string;
  contact: CatalogCheckoutContact;
  supabaseOrderId: number;
  returnUrl: string;
}): Promise<CashfreeOrder> {
  const config = getCashfreeConfig();
  let response: Response;

  try {
    response = await fetch(`${getCashfreeBaseUrl(config.environment)}/pg/orders`, {
      method: "POST",
      headers: {
        ...getCashfreeHeaders(config),
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        customer_details: {
          customer_email: params.contact.customerEmail,
          customer_id: `ks-customer-${params.supabaseOrderId}`,
          customer_name: params.contact.customerName,
          customer_phone: params.contact.customerPhone.replace(/\D/g, ""),
        },
        order_amount: Number((params.amountPaise / 100).toFixed(2)),
        order_currency: "INR",
        order_id: params.cashfreeOrderId,
        order_meta: { return_url: params.returnUrl },
        order_note: `Khazana Scoop order #${params.supabaseOrderId}`,
        order_tags: { website_order_id: String(params.supabaseOrderId) },
      }),
    });
  } catch (error) {
    console.error("Cashfree order request could not be completed", error);
    throw new ServiceError("We could not reach Cashfree to start your payment. Please try again.", 502);
  }

  if (!response.ok) {
    const message = await response.text();
    console.error("Cashfree order creation failed", { body: message, status: response.status });
    throw new ServiceError("We could not start your secure payment. Please try again.", 502);
  }

  const payload = (await response.json()) as CashfreeOrder;

  if (!payload.order_id || !payload.payment_session_id) {
    throw new ServiceError("Cashfree did not return an order and payment session id.", 502);
  }

  return payload;
}

export async function fetchCashfreeOrder(cashfreeOrderId: string): Promise<CashfreeOrder> {
  const config = getCashfreeConfig();
  const response = await fetch(
    `${getCashfreeBaseUrl(config.environment)}/pg/orders/${encodeURIComponent(cashfreeOrderId)}`,
    { headers: getCashfreeHeaders(config) },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new ServiceError(`Cashfree order lookup failed: ${response.status} ${message}`, 502);
  }

  const payload = (await response.json()) as CashfreeOrder;

  if (!payload.order_id || !payload.order_status) {
    throw new ServiceError("Cashfree did not return an order record.", 502);
  }

  return payload;
}

export async function fetchCashfreePayments(cashfreeOrderId: string): Promise<CashfreePayment[]> {
  const config = getCashfreeConfig();
  const response = await fetch(
    `${getCashfreeBaseUrl(config.environment)}/pg/orders/${encodeURIComponent(cashfreeOrderId)}/payments`,
    { headers: getCashfreeHeaders(config) },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new ServiceError(`Cashfree payment lookup failed: ${response.status} ${message}`, 502);
  }

  return (await response.json()) as CashfreePayment[];
}

function constantTimeEquals(expected: string, received: string): boolean {
  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function verifyCashfreeWebhookSignature(params: {
  payload: string;
  signature: string;
  timestamp: string;
}): boolean {
  const { secretKey } = getCashfreeConfig();
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(`${params.timestamp}${params.payload}`)
    .digest("base64");

  return constantTimeEquals(expectedSignature, params.signature);
}
