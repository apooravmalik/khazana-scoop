export const catalogCartStorageKey = "khazana_catalog_cart_v1";
export const catalogCartEventName = "khazana:catalog-cart-updated";

export type CatalogCartItem = {
  productId: number;
  quantity: number;
  slug: string;
};

function isCatalogCartItem(value: unknown): value is CatalogCartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CatalogCartItem>;
  return (
    Number.isInteger(candidate.productId) &&
    typeof candidate.slug === "string" &&
    Number.isInteger(candidate.quantity) &&
    Number(candidate.quantity) > 0
  );
}

export function normalizeCatalogCartItems(items: CatalogCartItem[]): CatalogCartItem[] {
  const merged = new Map<number, CatalogCartItem>();

  for (const item of items) {
    if (!isCatalogCartItem(item)) {
      continue;
    }

    const existing = merged.get(item.productId);
    merged.set(item.productId, {
      productId: item.productId,
      slug: item.slug,
      quantity: Math.max(1, (existing?.quantity ?? 0) + item.quantity),
    });
  }

  return Array.from(merged.values());
}

export function readCatalogCartFromStorage(): CatalogCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(catalogCartStorageKey);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeCatalogCartItems(parsed.filter(isCatalogCartItem));
  } catch {
    return [];
  }
}

export function writeCatalogCartToStorage(items: CatalogCartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeCatalogCartItems(items);
  window.localStorage.setItem(catalogCartStorageKey, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(catalogCartEventName, { detail: normalized }));
}

export function clearCatalogCartStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(catalogCartStorageKey);
  window.dispatchEvent(new CustomEvent(catalogCartEventName, { detail: [] }));
}

export function getCatalogCartItemCount(items: CatalogCartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
