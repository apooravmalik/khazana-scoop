"use client";

import { useEffect, useMemo, useState } from "react";
import {
  catalogCartEventName,
  clearCatalogCartStorage,
  type CatalogCartItem,
  getCatalogCartItemCount,
  readCatalogCartFromStorage,
  writeCatalogCartToStorage,
} from "@/lib/catalog-cart";

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
  const [items, setItems] = useState<CatalogCartItem[]>(() =>
    typeof window === "undefined" ? [] : readCatalogCartFromStorage(),
  );
  const itemCount = useMemo(() => getCatalogCartItemCount(items), [items]);

  useEffect(() => {
    const syncCart = () => {
      setItems(readCatalogCartFromStorage());
    };

    const handleCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent<CatalogCartItem[]>).detail;
      setItems(Array.isArray(detail) ? detail : readCatalogCartFromStorage());
    };

    window.addEventListener("storage", syncCart);
    window.addEventListener(catalogCartEventName, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(catalogCartEventName, handleCustomEvent as EventListener);
    };
  }, []);

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
