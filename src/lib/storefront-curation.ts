import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

export const HOME_CURATED_CAROUSEL_SLUGS = [
  "mystery-scoops",
  "lucky-capsules",
  "charm-mixes",
  "crystal-scoops",
  "stationery-packs",
] as const;

export const HOME_REEL_PLACEHOLDERS = [
  {
    description: "See how each order is packed with care, from scoop picks to the final finishing touches.",
    id: "team-packing",
    label: "Behind the scenes",
    title: "Packed with care",
  },
  {
    description: "Watch real reactions, favourite finds, and the little details customers loved most.",
    id: "customer-unboxing",
    label: "Customer love",
    title: "Real unboxings",
  },
  {
    description: "A quick look at the kinds of charms, stationery, beauty picks, and extras you might find inside.",
    id: "product-highlight",
    label: "Scoop preview",
    title: "What is inside",
  },
  {
    description: "Perfect for gifting inspiration, festive edits, and thoughtful surprise ideas for someone special.",
    id: "community-moment",
    label: "Gift ideas",
    title: "Moments worth sharing",
  },
] as const;

export function isHamperProduct(product: StorefrontCatalogProduct): boolean {
  const haystack = [
    product.name,
    product.slug,
    product.eyebrow,
    product.summary,
    product.category?.name ?? "",
    product.category?.slug ?? "",
    ...product.collections.map((collection) => `${collection.name} ${collection.slug}`),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes("hamper") || haystack.includes("gift");
}

export function getPrimaryTag(product: StorefrontCatalogProduct): string {
  return product.category?.name || product.collections[0]?.name || product.eyebrow || "Khazana Scoop";
}

export function pickProductsBySlugPreference(
  products: StorefrontCatalogProduct[],
  preferredSlugs: readonly string[],
  limit: number,
): StorefrontCatalogProduct[] {
  const preferred = preferredSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is StorefrontCatalogProduct => Boolean(product));

  const seen = new Set(preferred.map((product) => product.slug));
  const fill = products.filter((product) => {
    if (seen.has(product.slug)) {
      return false;
    }

    seen.add(product.slug);
    return true;
  });

  return [...preferred, ...fill].slice(0, limit);
}
