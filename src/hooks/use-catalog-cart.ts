"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  catalogCartEventName,
  catalogCartStorageKey,
  clearCatalogCartStorage,
  type CatalogCartItem,
  getCatalogCartItemCount,
  readCatalogCartFromStorage,
  writeCatalogCartToStorage,
} from "@/lib/catalog-cart";

const emptyCatalogCart: CatalogCartItem[] = [];
let cachedStorageValue: string | null | undefined;
let cachedCatalogCart: CatalogCartItem[] = emptyCatalogCart;

function getCatalogCartSnapshot(): CatalogCartItem[] {
  if (typeof window === "undefined") {
    return emptyCatalogCart;
  }

  let storageValue: string | null;

  try {
    storageValue = window.localStorage.getItem(catalogCartStorageKey);
  } catch {
    return emptyCatalogCart;
  }

  if (storageValue === cachedStorageValue) {
    return cachedCatalogCart;
  }

  cachedStorageValue = storageValue;
  cachedCatalogCart = readCatalogCartFromStorage();
  return cachedCatalogCart;
}

function getServerCatalogCartSnapshot(): CatalogCartItem[] {
  return emptyCatalogCart;
}

function subscribeToCatalogCart(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleCartChange = () => onStoreChange();

  window.addEventListener("storage", handleCartChange);
  window.addEventListener(catalogCartEventName, handleCartChange);

  return () => {
    window.removeEventListener("storage", handleCartChange);
    window.removeEventListener(catalogCartEventName, handleCartChange);
  };
}

function updateCartItemQuantity(
  items: CatalogCartItem[],
  productId: number,
  slug: string,
  quantity: number,
): CatalogCartItem[] {
  const nextItems = items.filter((item) => item.productId !== productId);

  if (quantity <= 0) {
    return nextItems;
  }

  return [
    ...nextItems,
    {
      productId,
      slug,
      quantity,
    },
  ];
}

export function useCatalogCart() {
  const items = useSyncExternalStore(
    subscribeToCatalogCart,
    getCatalogCartSnapshot,
    getServerCatalogCartSnapshot,
  );
  const itemCount = useMemo(() => getCatalogCartItemCount(items), [items]);

  return {
    items,
    itemCount,
    addItem(productId: number, slug: string, quantity: number) {
      const currentItems = readCatalogCartFromStorage();
      const existingItem = currentItems.find((item) => item.productId === productId);
      writeCatalogCartToStorage(
        updateCartItemQuantity(
          currentItems,
          productId,
          slug,
          (existingItem?.quantity ?? 0) + quantity,
        ),
      );
    },
    setQuantity(productId: number, slug: string, quantity: number) {
      writeCatalogCartToStorage(
        updateCartItemQuantity(readCatalogCartFromStorage(), productId, slug, quantity),
      );
    },
    removeItem(productId: number) {
      writeCatalogCartToStorage(
        readCatalogCartFromStorage().filter((item) => item.productId !== productId),
      );
    },
    clearCart() {
      clearCatalogCartStorage();
    },
  };
}
