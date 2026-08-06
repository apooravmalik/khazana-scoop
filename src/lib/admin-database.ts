import { addOns, currentUser, demoOrders, inventoryItems, scoopTiers } from "@/lib/data";
import { getPrisma, hasDatabaseUrl } from "@/lib/clients";
import { requireDatabase } from "@/lib/production-store";

export type AdminTableKey =
  | "users"
  | "orders"
  | "orderItems"
  | "inventory"
  | "tiers"
  | "addons"
  | "payments"
  | "shipping"
  | "reviews"
  | "points"
  | "storage";

export type AdminTableColumn = {
  key: string;
  label: string;
};

export type AdminTableConfig = {
  key: AdminTableKey;
  label: string;
  description: string;
  columns: AdminTableColumn[];
  primaryAction?: {
    label: string;
    href: string;
  };
};

export type AdminTableSnapshot = AdminTableConfig & {
  count: number;
  rows: Record<string, unknown>[];
  source: "demo" | "supabase";
};

type CountRow = {
  count: bigint | number | string;
};

export const adminTableConfigs: AdminTableConfig[] = [
  {
    key: "orders",
    label: "Orders",
    description: "Customer order status, totals, approval timers, and video/photo links.",
    columns: [
      { key: "id", label: "Order ID" },
      { key: "status", label: "Status" },
      { key: "totalCents", label: "Total" },
      { key: "createdAt", label: "Created" },
    ],
    primaryAction: { label: "Manage orders", href: "/admin/fulfillment" },
  },
  {
    key: "inventory",
    label: "Bulk inventory",
    description: "Stock on hand, reserved amounts, low-stock thresholds, and item categories.",
    columns: [
      { key: "itemName", label: "Item" },
      { key: "category", label: "Category" },
      { key: "totalWeightGrams", label: "On hand" },
      { key: "reservedGrams", label: "Reserved" },
      { key: "lowStockThreshold", label: "Threshold" },
    ],
    primaryAction: { label: "Manage inventory", href: "/admin/inventory" },
  },
  {
    key: "storage",
    label: "Storage assets",
    description: "Supabase bucket objects for product images, scoop photos, videos, and avatars.",
    columns: [
      { key: "kind", label: "Use" },
      { key: "bucket", label: "Bucket" },
      { key: "path", label: "Path" },
      { key: "createdAt", label: "Created" },
    ],
    primaryAction: { label: "Storage setup", href: "/admin/database?table=storage" },
  },
  {
    key: "users",
    label: "Users",
    description: "Customer and admin profiles, roles, points, and account dates.",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "scoopPoints", label: "Points" },
    ],
  },
  {
    key: "tiers",
    label: "Scoop tiers",
    description: "Small, Medium, and Large scoop storefront pricing.",
    columns: [
      { key: "name", label: "Name" },
      { key: "priceCents", label: "Price" },
      { key: "baseVolumeMl", label: "Volume" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "addons",
    label: "Add-ons",
    description: "Re-scoop, theme guarantee, lucky capsule, and future add-ons.",
    columns: [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "priceCents", label: "Price" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    description: "Stripe checkout session references, amounts, and payment states.",
    columns: [
      { key: "orderId", label: "Order" },
      { key: "provider", label: "Provider" },
      { key: "status", label: "Status" },
      { key: "amountCents", label: "Amount" },
    ],
  },
  {
    key: "shipping",
    label: "Shipping",
    description: "Recipient details, destinations, and tracking numbers.",
    columns: [
      { key: "orderId", label: "Order" },
      { key: "recipientName", label: "Recipient" },
      { key: "postalCode", label: "Postal code" },
      { key: "trackingNumber", label: "Tracking" },
    ],
  },
  {
    key: "orderItems",
    label: "Order items",
    description: "Line items connecting orders to scoop tiers and add-ons.",
    columns: [
      { key: "orderId", label: "Order" },
      { key: "tierId", label: "Tier" },
      { key: "addOnId", label: "Add-on" },
      { key: "quantity", label: "Qty" },
    ],
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Customer ratings and feedback on completed scoop experiences.",
    columns: [
      { key: "userId", label: "User" },
      { key: "orderId", label: "Order" },
      { key: "rating", label: "Rating" },
      { key: "createdAt", label: "Created" },
    ],
  },
  {
    key: "points",
    label: "Scoop points ledger",
    description: "Every reward points credit or adjustment for customer accounts.",
    columns: [
      { key: "userId", label: "User" },
      { key: "orderId", label: "Order" },
      { key: "points", label: "Points" },
      { key: "reason", label: "Reason" },
    ],
  },
];

export function getAdminTableConfig(key: string | undefined): AdminTableConfig {
  return adminTableConfigs.find((table) => table.key === key) ?? adminTableConfigs[0];
}

export async function getAdminTableSnapshot(key: AdminTableKey): Promise<AdminTableSnapshot> {
  const config = getAdminTableConfig(key);
  if (!hasDatabaseUrl()) {
    const rows = getDemoTableRows(key);
    return {
      ...config,
      count: rows.length,
      rows,
      source: "demo",
    };
  }
  requireDatabase();
  const [count, rows] = await Promise.all([getTableCount(key), getTableRows(key)]);
  return {
    ...config,
    count,
    rows,
    source: "supabase",
  };
}

function getDemoTableRows(key: AdminTableKey): Record<string, unknown>[] {
  switch (key) {
    case "orders":
      return demoOrders.map((order) => ({
        id: order.id,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
      }));
    case "inventory":
      return inventoryItems.map((item) => ({
        itemName: item.itemName,
        category: item.category,
        totalWeightGrams: item.onHandGrams,
        reservedGrams: item.reservedGrams,
        lowStockThreshold: item.lowStockThreshold,
      }));
    case "users":
      return [
        {
          name: currentUser.name,
          email: currentUser.email,
          role: "USER",
          scoopPoints: currentUser.scoopPoints,
        },
      ];
    case "tiers":
      return scoopTiers.map((tier) => ({
        name: tier.name,
        priceCents: tier.priceCents,
        baseVolumeMl: tier.volumeMl,
        active: true,
      }));
    case "addons":
      return addOns.map((addOn) => ({
        name: addOn.name,
        type: addOn.id,
        priceCents: addOn.priceCents,
        active: true,
      }));
    case "orderItems":
      return demoOrders.map((order) => ({
        orderId: order.id,
        tierId: order.tierName,
        addOnId: order.reScoopLimit > 0 ? "re-scoop" : "lucky-capsule",
        quantity: order.itemCount,
      }));
    case "payments":
      return demoOrders.map((order) => ({
        orderId: order.id,
        provider: "stripe",
        status: order.status === "Pending" ? "created" : "paid",
        amountCents: order.totalCents,
      }));
    case "shipping":
      return demoOrders.map((order, index) => ({
        orderId: order.id,
        recipientName: currentUser.name,
        postalCode: `1000${index}`,
        trackingNumber: order.status === "Shipped" || order.status === "Delivered" ? `MS-TRACK-${index + 1}` : "—",
      }));
    case "reviews":
      return [];
    case "points":
      return [
        {
          userId: currentUser.id,
          orderId: demoOrders[0]?.id ?? null,
          points: currentUser.scoopPoints,
          reason: "Demo loyalty balance",
        },
      ];
    case "storage":
      return [
        {
          kind: "PRODUCT_IMAGE",
          bucket: "product-media",
          path: "mystery-scoop-hero.png",
          createdAt: demoOrders[0]?.createdAt ?? currentUser.memberSince,
        },
      ];
    default:
      return [];
  }
}

async function getTableCount(key: AdminTableKey): Promise<number> {
  const prisma = getPrisma();
  const rows = (await prisma.$queryRawUnsafe(`select count(*) as count from ${getQuotedTableName(key)}`)) as CountRow[];
  const value = rows[0]?.count ?? 0;

  return Number(value);
}

async function getTableRows(key: AdminTableKey): Promise<Record<string, unknown>[]> {
  const prisma = getPrisma();
  return (await prisma.$queryRawUnsafe(
    `select * from ${getQuotedTableName(key)} order by ${getOrderColumn(key)} desc limit 25`,
  )) as Record<string, unknown>[];
}

function getQuotedTableName(key: AdminTableKey): string {
  const names: Record<AdminTableKey, string> = {
    users: '"User"',
    orders: '"Order"',
    orderItems: '"OrderItem"',
    inventory: '"BulkInventory"',
    tiers: '"ScoopTier"',
    addons: '"AddOn"',
    payments: '"Payment"',
    shipping: '"Shipping"',
    reviews: '"Review"',
    points: '"ScoopPointsLedger"',
    storage: '"StorageAsset"',
  };

  return names[key];
}

function getOrderColumn(key: AdminTableKey): string {
  if (key === "inventory" || key === "storage" || key === "orders") {
    return '"updatedAt"';
  }

  if (key === "tiers" || key === "addons" || key === "orderItems") {
    return '"id"';
  }

  return '"createdAt"';
}
