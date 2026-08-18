import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

export const HOME_BEST_SELLER_SLUGS = [
  "pearl-bloom-rin",
  "aurora-shell-hair-clip-set",
  "chai-biscuit-candle",
  "blush-crystal-phone-charm",
  "pink-daisy-hair-clip-set",
  "forever-rose-medallion",
  "tulip-scrunchie",
  "teddy-pens",
] as const;

export const HOME_TRENDING_PRODUCT_SLUGS = [
  "pastel-butterfly-phone-charm",
  "pink-teddy-garden-phone-charm",
  "pearl-blossom-hair-clip-set",
  "swan-hair-claw",
  "strawberry-polka-bow-headband",
  "orange-glow-grape-soap",
  "blush-bunny-charm-nails",
  "wildflower-leopard-french-nails",
] as const;

const HOMEPAGE_REELS_BASE_URL = "https://kkvbkrohjnuvcojgejod.supabase.co/storage/v1/object/public/homepage-reels";

export const HOME_REELS = [
  {
    id: "dhurandhar-perfume",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/dhurandhar-reel-perfume.mov`,
    title: "A little something special",
  },
  {
    id: "fire-writing",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/fire-writing.mp4`,
    title: "A little bit of magic",
  },
  {
    id: "reel-0609",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/reel-0609.m4v`,
    title: "Cute finds, all around",
  },
  {
    id: "reel-204710",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/reel-20260804-204710.mp4`,
    title: "Pick your favourite",
  },
  {
    id: "reel-204724",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/reel-20260804-204724.mp4`,
    title: "Tiny treasures",
  },
  {
    id: "reel-0612",
    label: "Khazana moment",
    src: `${HOMEPAGE_REELS_BASE_URL}/reel-0612.m4v`,
    title: "A scoop of joy",
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
