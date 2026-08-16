import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

export type ProductInformationSection = {
  id: "product-details" | "shipping-information" | "returns-refunds";
  title: string;
  paragraphs: string[];
  items: string[];
};

export function buildProductInformationSections(
  product: StorefrontCatalogProduct,
): ProductInformationSection[] {
  const productDetails =
    product.description.trim() ||
    product.summary.trim() ||
    `${product.name} is selected and packed with care by Khazana Scoop.`;

  return [
    {
      id: "product-details",
      title: "Product Details",
      paragraphs: [productDetails],
      items: [],
    },
    {
      id: "shipping-information",
      title: "Shipping Information",
      paragraphs: [
        "Shipping is ₹80 for orders below ₹500 and free for orders of ₹500 or more.",
        "Orders are dispatched in 1-2 days and usually delivered within 5-6 days. Tracking details are shared after dispatch.",
      ],
      items: [],
    },
    {
      id: "returns-refunds",
      title: "Returns & Refunds",
      paragraphs: [
        "For return or refund help, contact us with your order number and clear photos of the item.",
        "Items should be unused and in their original packaging unless they arrived damaged or incorrect. Approved refunds are returned to the original payment method.",
      ],
      items: [],
    },
  ];
}
