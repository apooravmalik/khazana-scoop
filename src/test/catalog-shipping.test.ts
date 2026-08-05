import { describe, expect, it } from "vitest";
import { calculateCatalogShippingPaise } from "@/lib/catalog-pricing";

describe("calculateCatalogShippingPaise", () => {
  it("charges ₹80 when a non-empty order subtotal is below ₹500", () => {
    expect(calculateCatalogShippingPaise(1)).toBe(8_000);
    expect(calculateCatalogShippingPaise(49_999)).toBe(8_000);
  });

  it("keeps shipping free at ₹500 and above", () => {
    expect(calculateCatalogShippingPaise(50_000)).toBe(0);
    expect(calculateCatalogShippingPaise(50_001)).toBe(0);
  });

  it("does not charge shipping for an empty cart", () => {
    expect(calculateCatalogShippingPaise(0)).toBe(0);
  });
});
