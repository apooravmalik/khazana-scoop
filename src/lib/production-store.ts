import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { addOns, demoOrders, inventoryItems, scoopTiers } from "@/lib/data";
import { SHIPPING_CENTS } from "@/lib/pricing";
import type { AddOn, CartLine, CartSelection, CartSummary, CustomerOrder, InventoryItem, OrderStatus, ScoopTier, UserProfile } from "@/lib/types";

export const SESSION_COOKIE_NAME = "mystery_scoop_session";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
  }
}

export type SessionResult = {
  user: UserProfile;
  token: string;
  expiresAt: Date;
};

type DbUserRow = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  scoopPoints: number;
  address: string | null;
  createdAt: string;
};

type DbSessionRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

type DbTierRow = {
  id: string;
  name: string;
  priceCents: number;
  baseVolumeMl: number;
  imageUrl: string;
  description: string;
  active: boolean;
};

type DbAddOnRow = {
  id: string;
  name: string;
  priceCents: number;
  type: string;
  description: string;
  active: boolean;
};

type DbOrderRow = {
  id: string;
  userId: string;
  status: string;
  packingVideoUrl: string | null;
  scoopPhotoUrl: string | null;
  totalCents: number;
  reScoopLimit: number;
  reScoopCount: number;
  approvalExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbOrderItemRow = {
  id: string;
  orderId: string;
  tierId: string | null;
  addOnId: string | null;
  quantity: number;
  priceCents: number;
};

type DbInventoryRow = {
  id: string;
  itemName: string;
  category: string;
  totalWeightGrams: number;
  reservedGrams: number;
  lowStockThreshold: number;
};

type DbPaymentRow = {
  id: string;
  orderId: string;
  provider: string;
  providerCheckoutSession: string | null;
  status: string;
  amountCents: number;
  createdAt: string;
};

type RestRequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST";
  prefer?: string;
  query?: URLSearchParams | Record<string, boolean | number | string | undefined>;
  write?: boolean;
};

const addOnTypes: Record<string, string> = {
  "re-scoop": "RE_SCOOP",
  theme: "THEME_GUARANTEE",
  "lucky-capsule": "LUCKY_CAPSULE",
};

export function hasSupabaseRestConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function requireDatabase(): void {
  if (!hasSupabaseRestConfig()) {
    throw new ServiceError(
      "Supabase REST access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a write-capable Supabase key.",
      503,
    );
  }
}

function getSupabaseRestConfig(write = false): { key: string; url: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = write
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new ServiceError(
      write
        ? "Supabase REST writes require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        : "Supabase REST access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a Supabase API key.",
      503,
    );
  }

  return { key, url };
}

function buildQueryString(query: RestRequestOptions["query"]): string {
  if (!query) {
    return "";
  }

  if (query instanceof URLSearchParams) {
    const value = query.toString();
    return value ? `?${value}` : "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const value = params.toString();
  return value ? `?${value}` : "";
}

async function restRequest<T>(table: string, options: RestRequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const config = getSupabaseRestConfig(options.write ?? method !== "GET");
  const response = await fetch(`${config.url}/rest/v1/${table}${buildQueryString(options.query)}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: {
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
    method,
    cache: "no-store",
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

function quoteInValue(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function buildInFilter(values: string[]): string {
  return `(${values.map(quoteInValue).join(",")})`;
}

function singleOrNull<T>(rows: T[]): T | null {
  return rows[0] ?? null;
}

function toIsoDate(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function fetchUserByEmail(email: string): Promise<DbUserRow | null> {
  const rows = await restRequest<DbUserRow[]>("User", {
    query: {
      email: `eq.${email}`,
      limit: 1,
      select: "id,email,passwordHash,name,role,scoopPoints,address,createdAt",
    },
  });

  return singleOrNull(rows);
}

async function fetchUserById(userId: string): Promise<DbUserRow | null> {
  const rows = await restRequest<DbUserRow[]>("User", {
    query: {
      id: `eq.${userId}`,
      limit: 1,
      select: "id,email,passwordHash,name,role,scoopPoints,address,createdAt",
    },
  });

  return singleOrNull(rows);
}

async function fetchSessionByTokenHash(tokenHash: string): Promise<DbSessionRow | null> {
  const rows = await restRequest<DbSessionRow[]>("Session", {
    query: {
      limit: 1,
      select: "id,userId,tokenHash,expiresAt,createdAt",
      tokenHash: `eq.${tokenHash}`,
    },
  });

  return singleOrNull(rows);
}

async function fetchActiveTierRows(): Promise<DbTierRow[]> {
  return restRequest<DbTierRow[]>("ScoopTier", {
    query: {
      active: "eq.true",
      order: "priceCents.asc",
      select: "id,name,priceCents,baseVolumeMl,imageUrl,description,active",
    },
  });
}

async function fetchActiveAddOnRows(): Promise<DbAddOnRow[]> {
  return restRequest<DbAddOnRow[]>("AddOn", {
    query: {
      active: "eq.true",
      order: "priceCents.desc",
      select: "id,name,priceCents,type,description,active",
    },
  });
}

async function resolveSelection(selection: CartSelection): Promise<{ selectedAddOns: DbAddOnRow[]; tier: DbTierRow }> {
  await ensureCatalogSeed();
  const [tiers, addOnRows] = await Promise.all([fetchActiveTierRows(), fetchActiveAddOnRows()]);
  const tier = tiers.find((row) => row.id === selection.tierId || row.name === selection.tierId);

  if (!tier) {
    throw new ServiceError("Selected scoop tier is unavailable.", 404);
  }

  const selectedAddOns = addOnRows.filter((row) => selection.addOnIds.includes(row.id));

  if (selectedAddOns.length !== selection.addOnIds.length) {
    throw new ServiceError("One or more selected add-ons are unavailable.", 404);
  }

  return { selectedAddOns, tier };
}

async function fetchOrderRows(filters: { id?: string; userId?: string } = {}): Promise<DbOrderRow[]> {
  const query = new URLSearchParams({
    order: "createdAt.desc",
    select: "id,userId,status,packingVideoUrl,scoopPhotoUrl,totalCents,reScoopLimit,reScoopCount,approvalExpiresAt,createdAt,updatedAt",
  });

  if (filters.id) {
    query.set("id", `eq.${filters.id}`);
    query.set("limit", "1");
  }

  if (filters.userId) {
    query.set("userId", `eq.${filters.userId}`);
  }

  return restRequest<DbOrderRow[]>("Order", { query });
}

async function fetchOrderItemsByOrderIds(orderIds: string[]): Promise<DbOrderItemRow[]> {
  if (orderIds.length === 0) {
    return [];
  }

  return restRequest<DbOrderItemRow[]>("OrderItem", {
    query: {
      orderId: `in.${buildInFilter(orderIds)}`,
      select: "id,orderId,tierId,addOnId,quantity,priceCents",
    },
  });
}

async function fetchTierRowsByIds(tierIds: string[]): Promise<DbTierRow[]> {
  if (tierIds.length === 0) {
    return [];
  }

  return restRequest<DbTierRow[]>("ScoopTier", {
    query: {
      id: `in.${buildInFilter(tierIds)}`,
      select: "id,name,priceCents,baseVolumeMl,imageUrl,description,active",
    },
  });
}

async function hydrateCustomerOrders(orderRows: DbOrderRow[]): Promise<CustomerOrder[]> {
  if (orderRows.length === 0) {
    return [];
  }

  const orderItems = await fetchOrderItemsByOrderIds(orderRows.map((order) => order.id));
  const tierIds = [...new Set(orderItems.flatMap((item) => (item.tierId ? [item.tierId] : [])))];
  const tiers = await fetchTierRowsByIds(tierIds);
  const tiersById = new Map(tiers.map((tier) => [tier.id, tier]));
  const itemsByOrderId = new Map<string, DbOrderItemRow[]>();

  for (const item of orderItems) {
    const existing = itemsByOrderId.get(item.orderId) ?? [];
    existing.push(item);
    itemsByOrderId.set(item.orderId, existing);
  }

  return orderRows.map((order) => {
    const items = itemsByOrderId.get(order.id) ?? [];
    const tierName = items.flatMap((item) => (item.tierId ? [tiersById.get(item.tierId)] : [])).find(Boolean)?.name ?? "Medium Scoop";
    const itemCount = items.reduce((total, item) => total + Number(item.quantity ?? 0), 0) || items.length || 1;
    return toCustomerOrder(order, tierName, itemCount);
  });
}

async function fetchSingleOrderRow(orderId: string): Promise<DbOrderRow | null> {
  const rows = await fetchOrderRows({ id: orderId });
  return singleOrNull(rows);
}

export async function ensureCatalogSeed(): Promise<void> {
  requireDatabase();
  const [existingTier, existingAddOn] = await Promise.all([
    restRequest<Pick<DbTierRow, "id">[]>("ScoopTier", { query: { limit: 1, select: "id" } }),
    restRequest<Pick<DbAddOnRow, "id">[]>("AddOn", { query: { limit: 1, select: "id" } }),
  ]);

  if (existingTier.length === 0) {
    await restRequest<DbTierRow[]>("ScoopTier", {
      body: scoopTiers.map((tier) => ({
        active: true,
        baseVolumeMl: tier.volumeMl,
        description: tier.description,
        id: tier.id,
        imageUrl: "/mystery-scoop-hero.png",
        name: tier.name,
        priceCents: tier.priceCents,
      })),
      method: "POST",
      prefer: "return=representation",
      write: true,
    });
  }

  if (existingAddOn.length === 0) {
    await restRequest<DbAddOnRow[]>("AddOn", {
      body: addOns.map((addOn) => ({
        active: true,
        description: addOn.description,
        id: addOn.id,
        name: addOn.name,
        priceCents: addOn.priceCents,
        type: addOnTypes[addOn.id] ?? "LUCKY_CAPSULE",
      })),
      method: "POST",
      prefer: "return=representation",
      write: true,
    });
  }

}

export async function registerUser(name: string, email: string, password: string): Promise<SessionResult> {
  requireDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await fetchUserByEmail(normalizedEmail);

  if (existing) {
    throw new ServiceError("An account already exists for this email address.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const rows = await restRequest<DbUserRow[]>("User", {
    body: [
      {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: "USER",
      },
    ],
    method: "POST",
    prefer: "return=representation",
    write: true,
  });
  const user = rows[0];

  if (!user) {
    throw new ServiceError("The account could not be created.", 500);
  }

  return createSessionForUser(user);
}

export async function loginUser(email: string, password: string): Promise<SessionResult> {
  requireDatabase();
  const user = await fetchUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new ServiceError("Invalid credentials.", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ServiceError("Invalid credentials.", 401);
  }

  return createSessionForUser(user);
}

export async function logoutUser(sessionToken: string | undefined): Promise<void> {
  if (!sessionToken || !hasSupabaseRestConfig()) {
    return;
  }

  await restRequest<unknown>("Session", {
    method: "DELETE",
    query: { tokenHash: `eq.${hashToken(sessionToken)}` },
    write: true,
  });
}

export async function getUserFromSession(sessionToken: string | undefined): Promise<UserProfile | null> {
  if (!sessionToken || !hasSupabaseRestConfig()) {
    return null;
  }

  const session = await fetchSessionByTokenHash(hashToken(sessionToken));

  if (!session || new Date(session.expiresAt) <= new Date()) {
    return null;
  }

  const user = await fetchUserById(session.userId);
  return user ? toUserProfile(user) : null;
}

export async function requireUserFromSession(sessionToken: string | undefined): Promise<UserProfile> {
  const user = await getUserFromSession(sessionToken);
  if (!user) {
    throw new ServiceError("Authentication required.", 401);
  }

  return user;
}

export async function getCatalog(): Promise<{ tiers: ScoopTier[]; addOns: AddOn[] }> {
  await ensureCatalogSeed();
  const [tiers, catalogAddOns] = await Promise.all([fetchActiveTierRows(), fetchActiveAddOnRows()]);

  return {
    tiers: tiers.map(toScoopTier),
    addOns: catalogAddOns.map(toAddOn),
  };
}

export async function calculateDatabaseCart(selection: CartSelection): Promise<CartSummary> {
  const { selectedAddOns, tier } = await resolveSelection(selection);
  const lines: CartLine[] = [
    { label: tier.name, priceCents: Number(tier.priceCents), quantity: 1 },
    ...selectedAddOns.map((addOn) => ({
      label: addOn.name,
      priceCents: Number(addOn.priceCents),
      quantity: 1,
    })),
  ];
  const subtotalCents = lines.reduce((total, line) => total + line.priceCents * line.quantity, 0);
  const totalCents = subtotalCents + SHIPPING_CENTS;

  return {
    lines,
    subtotalCents,
    shippingCents: SHIPPING_CENTS,
    totalCents,
    pointsEarned: Math.floor(totalCents / 10),
  };
}

export async function createOrder(userId: string, selection: CartSelection): Promise<CustomerOrder> {
  const { selectedAddOns, tier } = await resolveSelection(selection);
  const totalCents = calculateTotalCents(tier, selectedAddOns);
  const hasReScoop = selectedAddOns.some((addOn) => addOn.type === "RE_SCOOP");
  const orderRows = await restRequest<DbOrderRow[]>("Order", {
    body: [
      {
        reScoopLimit: hasReScoop ? 1 : 0,
        status: "PENDING",
        totalCents,
        userId,
      },
    ],
    method: "POST",
    prefer: "return=representation",
    write: true,
  });
  const order = orderRows[0];

  if (!order) {
    throw new ServiceError("The order could not be created.", 500);
  }

  await restRequest<DbOrderItemRow[]>("OrderItem", {
    body: [
      {
        orderId: order.id,
        priceCents: Number(tier.priceCents),
        quantity: 1,
        tierId: tier.id,
      },
      ...selectedAddOns.map((addOn) => ({
        addOnId: addOn.id,
        orderId: order.id,
        priceCents: Number(addOn.priceCents),
        quantity: 1,
      })),
    ],
    method: "POST",
    prefer: "return=representation",
    write: true,
  });

  return toCustomerOrder(order, tier.name, selectedAddOns.length + 1);
}

export async function listOrders(userId?: string): Promise<CustomerOrder[]> {
  if (!hasSupabaseRestConfig()) {
    return demoOrders;
  }

  requireDatabase();
  const orderRows = await fetchOrderRows(userId ? { userId } : {});
  return hydrateCustomerOrders(orderRows);
}

export async function getOrder(orderId: string): Promise<CustomerOrder | null> {
  if (!hasSupabaseRestConfig()) {
    return demoOrders.find((order) => order.id === orderId) ?? null;
  }

  requireDatabase();
  const orderRows = await fetchOrderRows({ id: orderId });
  const orders = await hydrateCustomerOrders(orderRows);
  return orders[0] ?? null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<CustomerOrder | null> {
  requireDatabase();
  const rows = await restRequest<DbOrderRow[]>("Order", {
    body: { status: toDbOrderStatus(status) },
    method: "PATCH",
    prefer: "return=representation",
    query: { id: `eq.${orderId}` },
    write: true,
  });

  if (!rows[0]) {
    return null;
  }

  return getOrder(orderId);
}

export async function attachPackingVideo(orderId: string, packingVideoUrl: string, scoopPhotoUrl?: string): Promise<CustomerOrder | null> {
  requireDatabase();
  const rows = await restRequest<DbOrderRow[]>("Order", {
    body: {
      approvalExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      packingVideoUrl,
      scoopPhotoUrl,
      status: "AWAITING_APPROVAL",
    },
    method: "PATCH",
    prefer: "return=representation",
    query: { id: `eq.${orderId}` },
    write: true,
  });

  if (!rows[0]) {
    return null;
  }

  return getOrder(orderId);
}

export async function acceptScoop(orderId: string): Promise<CustomerOrder | null> {
  return updateOrderStatus(orderId, "Scooped");
}

export async function triggerReScoop(orderId: string): Promise<CustomerOrder | null> {
  requireDatabase();
  const existing = await fetchSingleOrderRow(orderId);

  if (!existing || Number(existing.reScoopCount) >= Number(existing.reScoopLimit)) {
    return null;
  }

  const rows = await restRequest<DbOrderRow[]>("Order", {
    body: {
      approvalExpiresAt: null,
      reScoopCount: Number(existing.reScoopCount) + 1,
      scoopPhotoUrl: null,
      status: "PENDING",
    },
    method: "PATCH",
    prefer: "return=representation",
    query: { id: `eq.${orderId}` },
    write: true,
  });

  if (!rows[0]) {
    return null;
  }

  return getOrder(orderId);
}

export async function listInventory(): Promise<InventoryItem[]> {
  if (!hasSupabaseRestConfig()) {
    return inventoryItems;
  }

  const rows = await restRequest<DbInventoryRow[]>("BulkInventory", {
    query: {
      order: "itemName.asc",
      select: "id,itemName,category,totalWeightGrams,reservedGrams,lowStockThreshold",
    },
  });
  return rows.length > 0 ? rows.map(toInventoryItem) : inventoryItems;
}

export async function updateInventory(
  itemId: string,
  onHandGrams: number,
  reservedGrams: number,
  lowStockThreshold: number,
): Promise<InventoryItem | null> {
  requireDatabase();
  const rows = await restRequest<DbInventoryRow[]>("BulkInventory", {
    body: {
      lowStockThreshold,
      reservedGrams,
      totalWeightGrams: onHandGrams,
    },
    method: "PATCH",
    prefer: "return=representation",
    query: { id: `eq.${itemId}` },
    write: true,
  });
  const item = rows[0];

  return item ? toInventoryItem(item) : null;
}

export async function createPaymentForOrder(orderId: string, providerCheckoutSession: string, amountCents: number): Promise<void> {
  requireDatabase();
  const existingRows = await restRequest<DbPaymentRow[]>("Payment", {
    query: {
      limit: 1,
      orderId: `eq.${orderId}`,
      select: "id,orderId,provider,providerCheckoutSession,status,amountCents,createdAt",
    },
  });
  const existing = existingRows[0];

  if (existing) {
    await restRequest<DbPaymentRow[]>("Payment", {
      body: {
        amountCents,
        providerCheckoutSession,
        status: "created",
      },
      method: "PATCH",
      prefer: "return=representation",
      query: { id: `eq.${existing.id}` },
      write: true,
    });
    return;
  }

  await restRequest<DbPaymentRow[]>("Payment", {
    body: [
      {
        amountCents,
        orderId,
        provider: "stripe",
        providerCheckoutSession,
        status: "created",
      },
    ],
    method: "POST",
    prefer: "return=representation",
    write: true,
  });
}

export async function markStripeCheckoutPaid(orderId: string, checkoutSessionId: string | null): Promise<void> {
  requireDatabase();
  const existingRows = await restRequest<DbPaymentRow[]>("Payment", {
    query: {
      limit: 1,
      orderId: `eq.${orderId}`,
      select: "id,orderId,provider,providerCheckoutSession,status,amountCents,createdAt",
    },
  });
  const existing = existingRows[0];

  if (!existing) {
    return;
  }

  await restRequest<DbPaymentRow[]>("Payment", {
    body: {
      providerCheckoutSession: checkoutSessionId ?? existing.providerCheckoutSession,
      status: "paid",
    },
    method: "PATCH",
    prefer: "return=representation",
    query: { id: `eq.${existing.id}` },
    write: true,
  });
}

async function createSessionForUser(user: DbUserRow): Promise<SessionResult> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await restRequest<DbSessionRow[]>("Session", {
    body: [
      {
        expiresAt: expiresAt.toISOString(),
        tokenHash: hashToken(token),
        userId: user.id,
      },
    ],
    method: "POST",
    prefer: "return=representation",
    write: true,
  });

  return {
    user: toUserProfile(user),
    token,
    expiresAt,
  };
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function calculateTotalCents(tier: DbTierRow, selectedAddOns: DbAddOnRow[]): number {
  return Number(tier.priceCents) + selectedAddOns.reduce((total, addOn) => total + Number(addOn.priceCents), 0) + SHIPPING_CENTS;
}

function toUserProfile(user: DbUserRow): UserProfile {
  return {
    email: user.email,
    id: user.id,
    memberSince: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(user.createdAt)),
    name: user.name,
    scoopPoints: Number(user.scoopPoints ?? 0),
  };
}

function toScoopTier(tier: DbTierRow): ScoopTier {
  return {
    description: tier.description,
    id: tier.id,
    imageHint: tier.imageUrl,
    name: tier.name as ScoopTier["name"],
    priceCents: Number(tier.priceCents),
    volumeMl: Number(tier.baseVolumeMl),
  };
}

function toAddOn(addOn: DbAddOnRow): AddOn {
  return {
    description: addOn.description,
    id: addOn.id,
    name: addOn.name as AddOn["name"],
    priceCents: Number(addOn.priceCents),
  };
}

function toInventoryItem(item: DbInventoryRow): InventoryItem {
  return {
    availableGrams: Math.max(0, Number(item.totalWeightGrams) - Number(item.reservedGrams)),
    category: item.category,
    id: item.id,
    itemName: item.itemName,
    lowStockThreshold: Number(item.lowStockThreshold),
    onHandGrams: Number(item.totalWeightGrams),
    reservedGrams: Number(item.reservedGrams),
  };
}

function toCustomerOrder(order: DbOrderRow, tierName: string, itemCount: number): CustomerOrder {
  return {
    approvalExpiresAt: toIsoDate(order.approvalExpiresAt) ?? undefined,
    createdAt: new Date(order.createdAt).toISOString().slice(0, 10),
    id: order.id,
    itemCount,
    packingVideoUrl: order.packingVideoUrl ?? undefined,
    reScoopCount: Number(order.reScoopCount ?? 0),
    reScoopLimit: Number(order.reScoopLimit ?? 0),
    scoopPhotoUrl: order.scoopPhotoUrl ?? undefined,
    status: fromDbOrderStatus(order.status),
    tierName: tierName as CustomerOrder["tierName"],
    totalCents: Number(order.totalCents),
  };
}

function toDbOrderStatus(status: OrderStatus): string {
  const statuses: Record<OrderStatus, string> = {
    "Awaiting Approval": "AWAITING_APPROVAL",
    Cancelled: "CANCELLED",
    Delivered: "DELIVERED",
    Pending: "PENDING",
    Scooped: "SCOOPED",
    Shipped: "SHIPPED",
  };

  return statuses[status];
}

function fromDbOrderStatus(status: string): OrderStatus {
  const statuses: Record<string, OrderStatus> = {
    AWAITING_APPROVAL: "Awaiting Approval",
    CANCELLED: "Cancelled",
    DELIVERED: "Delivered",
    PENDING: "Pending",
    SCOOPED: "Scooped",
    SHIPPED: "Shipped",
  };

  return statuses[status] ?? "Pending";
}
