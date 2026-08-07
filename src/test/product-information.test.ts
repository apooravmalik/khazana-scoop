import { describe, expect, it } from "vitest";

import type { StorefrontCatalogProduct } from "@/lib/catalog-types";
import { buildProductInformationSections } from "@/lib/product-information";

const product: StorefrontCatalogProduct = {
  id: 12,
  slug: "bookmark",
  name: "Bookmark",
  eyebrow: "Stationery",
  summary: "A cheerful page marker for everyday reading.",
  description: "A lightweight illustrated bookmark made for books and journals.",
  image: "/bookmark.png",
  gallery: [],
  category: { id: 4, name: "Stationery", slug: "stationery" },
  collections: [],
  availableColours: ["Pink", "Blue"],
  highlights: ["Lightweight", "Gift-ready"],
  basePrice: 99,
  effectivePrice: 99,
  priceLabel: "₹99",
  originalPriceLabel: null,
  activeDiscount: null,
  stockQuantity: 30,
  route: "/products/bookmark",
};

describe("buildProductInformationSections", () => {
  it("builds product-specific details and the three requested sections", () => {
    const sections = buildProductInformationSections(product);

    expect(sections.map((section) => section.title)).toEqual([
      "Product Details",
      "Shipping Information",
      "Returns & Refunds",
    ]);
    expect(sections[0]).toMatchObject({
      paragraphs: ["A lightweight illustrated bookmark made for books and journals."],
      items: [
        "Category: Stationery",
        "Available colours: Pink, Blue",
        "Highlights: Lightweight, Gift-ready",
      ],
    });
  });

  it("keeps shipping and returns information identical for every product", () => {
    const first = buildProductInformationSections(product);
    const second = buildProductInformationSections({
      ...product,
      id: 13,
      name: "Eraser",
      slug: "eraser",
      description: "A soft novelty eraser.",
      category: { id: 5, name: "School Supplies", slug: "school-supplies" },
      availableColours: ["Green"],
      highlights: ["Soft finish"],
    });

    expect(second.slice(1)).toEqual(first.slice(1));
    expect(first[1].paragraphs).toEqual([
      "Free shipping on orders above ₹499. For orders of ₹499 or below, a flat ₹80 shipping charge will be added at checkout.",
      "All orders are carefully packed to ensure your products reach you safely. Once your order has been dispatched, tracking details will be shared with you.",
    ]);
    expect(first[2].paragraphs).toEqual([
      "We carefully check and pack every order before dispatch. Returns or exchanges are not accepted for change of mind or personal preference.",
      "If you receive an incorrect, damaged or defective product, please contact us as soon as possible after delivery with clear photos/videos of the product and packaging. Once the issue is verified, we will assist you with an appropriate replacement or refund, depending on the case.",
      "Refunds, where applicable, will be processed to the original payment method.",
    ]);
  });
});
