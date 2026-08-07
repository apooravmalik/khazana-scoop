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
  const categoryName = product.category?.name || product.eyebrow.trim();
  const productFacts = [
    categoryName ? `Category: ${categoryName}` : null,
    product.availableColours.length > 0
      ? `Available colours: ${product.availableColours.join(", ")}`
      : null,
    product.highlights.length > 0
      ? `Highlights: ${product.highlights.join(", ")}`
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  return [
    {
      id: "product-details",
      title: "Product Details",
      paragraphs: [productDetails],
      items: productFacts,
    },
    {
      id: "shipping-information",
      title: "Shipping Information",
      paragraphs: [
        "Free shipping on orders above ₹499. For orders of ₹499 or below, a flat ₹80 shipping charge will be added at checkout.",
        "All orders are carefully packed to ensure your products reach you safely. Once your order has been dispatched, tracking details will be shared with you.",
      ],
      items: [],
    },
    {
      id: "returns-refunds",
      title: "Returns & Refunds",
      paragraphs: [
        "We carefully check and pack every order before dispatch. Returns or exchanges are not accepted for change of mind or personal preference.",
        "If you receive an incorrect, damaged or defective product, please contact us as soon as possible after delivery with clear photos/videos of the product and packaging. Once the issue is verified, we will assist you with an appropriate replacement or refund, depending on the case.",
        "Refunds, where applicable, will be processed to the original payment method.",
      ],
      items: [],
    },
  ];
}
