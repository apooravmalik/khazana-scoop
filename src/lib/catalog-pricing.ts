export const FREE_SHIPPING_THRESHOLD_PAISE = 50_000;
export const STANDARD_SHIPPING_PAISE = 8_000;

export function calculateCatalogShippingPaise(subtotalPaise: number): number {
  if (subtotalPaise <= 0 || subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE) {
    return 0;
  }

  return STANDARD_SHIPPING_PAISE;
}
