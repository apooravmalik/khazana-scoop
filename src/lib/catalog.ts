import { getProductBySlug } from "@/lib/products";
import type {
  CatalogCategory,
  CatalogCollection,
  CatalogDiscount,
  CatalogImage,
  StorefrontCatalogCollectionSection,
  StorefrontCatalogFacet,
  StorefrontCatalogHomeData,
  StorefrontCatalogProduct,
} from "@/lib/catalog-types";

type ProductRow = {
  id: number | string;
  name: string;
  view_name: string | null;
  slug: string | null;
  description: string | null;
  base_price: number | string | null;
  selling_price: number | string | null;
  primary_image_url: string | null;
  available_colours: string[] | null;
  stock_quantity: number | string | null;
  active: boolean | null;
  category: string | null;
  category_id: number | string | null;
};

type CategoryRow = {
  id: number | string;
  name: string;
  slug: string;
  active?: boolean | null;
  sort_order?: number | string | null;
};

type CollectionRow = {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  active?: boolean | null;
};

type LegacyCollectionRow = {
  id: number | string;
  name: string;
  slug: string;
  active?: boolean | null;
};

type ProductCollectionRow = {
  product_id: number | string;
  collection_id: number | string;
};

type ProductImageRow = {
  id: number | string;
  product_id: number | string;
  url: string;
  alt_text: string | null;
  sort_order: number | string | null;
};

type DiscountRow = {
  id: number | string;
  target_type: "product" | "category" | "collection";
  target_id: number | string;
  amount: number | string;
  type: "fixed" | "percent";
  start_at: string | null;
  end_at: string | null;
  active: boolean | null;
};

const catalogCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function hasCatalogConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCatalogPrice(value: number | null): string {
  if (value === null) {
    return "Price on request";
  }

  return catalogCurrencyFormatter.format(value);
}

function summarizeDescription(description: string): string {
  const [firstSentence] = description.split(/(?<=[.!?])\s+/);
  return firstSentence?.trim() || description;
}

function mapFallbackProduct(slug: string): StorefrontCatalogProduct | null {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    id: 0,
    slug: product.slug,
    name: product.name,
    eyebrow: product.eyebrow,
    summary: product.summary,
    description: product.description,
    image: product.image,
    gallery: [],
    category: null,
    collections: [],
    availableColours: [],
    highlights: product.highlights,
    basePrice: null,
    effectivePrice: null,
    priceLabel: product.priceLabel,
    originalPriceLabel: null,
    activeDiscount: null,
    stockQuantity: 0,
    route: product.route,
  };
}

function mapFallbackProducts(): StorefrontCatalogProduct[] {
  // Fallback when Supabase config is missing – return an empty list.
  return [];
}

async function fetchTable<T>(table: string, query: Record<string, string>): Promise<T[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return [];
  }

  const searchParams = new URLSearchParams(query);
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?${searchParams.toString()}`, {
    cache: "no-store",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to load ${table}: ${response.status} ${message}`.trim());
  }

  return (await response.json()) as T[];
}

async function fetchCollectionRows(): Promise<CollectionRow[]> {
  try {
    return await fetchTable<CollectionRow>("collections", {
      select: "id,name,slug,description,active",
      active: "eq.true",
      order: "sort_order.asc,name.asc,id.asc",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("description")) {
      throw error;
    }

    const legacyRows = await fetchTable<LegacyCollectionRow>("collections", {
      select: "id,name,slug,active",
      active: "eq.true",
      order: "sort_order.asc,name.asc,id.asc",
    });

    return legacyRows.map((row) => ({ ...row, description: null }));
  }
}

async function fetchCategoryRows(): Promise<CategoryRow[]> {
  return fetchTable<CategoryRow>("categories", {
    select: "id,name,slug,active,sort_order",
    active: "eq.true",
    order: "sort_order.asc,name.asc,id.asc",
  });
}

function mapCategory(row: CategoryRow): CatalogCategory {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
  };
}

function mapCollection(row: CollectionRow): CatalogCollection {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    description: row.description,
  };
}

function mapImage(row: ProductImageRow): CatalogImage {
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    url: row.url,
    altText: row.alt_text,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapDiscount(row: DiscountRow): CatalogDiscount {
  return {
    id: Number(row.id),
    targetType: row.target_type,
    targetId: Number(row.target_id),
    amount: toNumber(row.amount),
    type: row.type,
    startAt: row.start_at,
    endAt: row.end_at,
    active: Boolean(row.active ?? true),
  };
}

function isDiscountActive(discount: CatalogDiscount, now = new Date()): boolean {
  if (!discount.active) {
    return false;
  }

  const startsAt = discount.startAt ? new Date(discount.startAt) : null;
  const endsAt = discount.endAt ? new Date(discount.endAt) : null;

  if (startsAt && startsAt > now) {
    return false;
  }

  if (endsAt && endsAt < now) {
    return false;
  }

  return true;
}

function applyDiscount(basePrice: number, discount: CatalogDiscount | null): number {
  if (!discount) {
    return basePrice;
  }

  if (discount.type === "percent") {
    return Math.max(0, basePrice - basePrice * (discount.amount / 100));
  }

  return Math.max(0, basePrice - discount.amount);
}

function pickBestDiscount(
  productId: number,
  categoryId: number | null,
  collections: CatalogCollection[],
  discounts: CatalogDiscount[],
  basePrice: number,
): CatalogDiscount | null {
  const candidates = discounts.filter((discount) => {
    if (!isDiscountActive(discount)) {
      return false;
    }

    if (discount.targetType === "product") {
      return discount.targetId === productId;
    }

    if (discount.targetType === "category") {
      return categoryId !== null && discount.targetId === categoryId;
    }

    return collections.some((collection) => collection.id === discount.targetId);
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce<CatalogDiscount | null>((best, candidate) => {
    if (!best) {
      return candidate;
    }

    return applyDiscount(basePrice, candidate) < applyDiscount(basePrice, best) ? candidate : best;
  }, null);
}

function buildHighlights(
  category: CatalogCategory | null,
  collections: CatalogCollection[],
  colours: string[],
): string[] {
  const highlights = [
    ...(category ? [`Category: ${category.name}`] : []),
    ...collections.slice(0, 2).map((collection) => `${collection.name} collection`),
    ...colours.slice(0, 2).map((colour) => `${colour} option`),
  ];

  return highlights.slice(0, 3);
}

function buildFacetMap(
  products: StorefrontCatalogProduct[],
  kind: "category" | "collection",
): StorefrontCatalogFacet[] {
  const facets = new Map<string, StorefrontCatalogFacet>();

  for (const product of products) {
    const sources =
      kind === "category"
        ? product.category
          ? [product.category]
          : []
        : product.collections;

    for (const facet of sources) {
      const existing = facets.get(facet.slug);

      if (!existing) {
        facets.set(facet.slug, {
          id: facet.id,
          name: facet.name,
          slug: facet.slug,
          image: product.image,
          href:
            kind === "category"
              ? `/products?category=${encodeURIComponent(facet.slug)}`
              : `/products?collection=${encodeURIComponent(facet.slug)}`,
          productCount: 1,
        });
        continue;
      }

      facets.set(facet.slug, {
        ...existing,
        productCount: existing.productCount + 1,
      });
    }
  }

  return Array.from(facets.values()).sort((left, right) => {
    if (right.productCount !== left.productCount) {
      return right.productCount - left.productCount;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildCollectionFacets(
  collections: CatalogCollection[],
  products: StorefrontCatalogProduct[],
): StorefrontCatalogFacet[] {
  return collections.map((collection) => {
    const matchingProducts = products.filter((product) =>
      product.collections.some((item) => item.id === collection.id),
    );

    return {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      image: matchingProducts[0]?.image || "/mystery-scoop-hero.png",
      href: `/products?collection=${encodeURIComponent(collection.slug)}`,
      productCount: matchingProducts.length,
      description: collection.description,
    } satisfies StorefrontCatalogFacet;
  });
}

function buildCategoryFacets(
  categories: CategoryRow[],
  products: StorefrontCatalogProduct[],
): StorefrontCatalogFacet[] {
  return categories.map((category) => {
    const categoryId = Number(category.id);
    const matchingProducts = products.filter((product) => product.category?.id === categoryId);

    return {
      id: categoryId,
      name: category.name,
      slug: category.slug,
      image: matchingProducts[0]?.image || "/mystery-scoop-hero.png",
      href: `/products?category=${encodeURIComponent(category.slug)}`,
      productCount: matchingProducts.length,
    } satisfies StorefrontCatalogFacet;
  });
}

function buildCollectionSections(
  collections: StorefrontCatalogFacet[],
  products: StorefrontCatalogProduct[],
): StorefrontCatalogCollectionSection[] {
  return collections
    .map((collection) => ({
      collection,
      products: products.filter((product) =>
        product.collections.some((item) => item.slug === collection.slug),
      ),
    }))
    .filter((section) => section.products.length > 0);
}

export async function getStorefrontCatalogProducts(): Promise<StorefrontCatalogProduct[]> {
  if (!hasCatalogConfig()) {
    return mapFallbackProducts();
  }

  try {
    const [products, categories, collections, links, images, discounts] = await Promise.all([
      fetchTable<ProductRow>("products", {
        select:
          "id,name,view_name,slug,description,base_price,selling_price,primary_image_url,available_colours,stock_quantity,active,category_id",
        active: "eq.true",
        order: "sort_order.asc,name.asc,id.asc",
      }),
      fetchTable<CategoryRow>("categories", {
        select: "id,name,slug,active",
        active: "eq.true",
        order: "sort_order.asc,name.asc,id.asc",
      }),
      fetchCollectionRows(),
      fetchTable<ProductCollectionRow>("product_collections", {
        select: "product_id,collection_id",
      }),
      fetchTable<ProductImageRow>("product_images", {
        select: "id,product_id,url,alt_text,sort_order",
        order: "sort_order.asc,id.asc",
      }),
      fetchTable<DiscountRow>("discounts", {
        select: "id,target_type,target_id,amount,type,start_at,end_at,active",
        active: "eq.true",
        order: "created_at.desc,id.desc",
      }),
    ]);

    const categoryMap = new Map(categories.map((row) => [Number(row.id), mapCategory(row)]));
    const collectionMap = new Map(collections.map((row) => [Number(row.id), mapCollection(row)]));
    const imagesByProductId = images
      .map(mapImage)
      .reduce((acc, image) => {
        const current = acc.get(image.productId) ?? [];
        current.push(image);
        acc.set(image.productId, current);
        return acc;
      }, new Map<number, CatalogImage[]>());
    const collectionsByProductId = links.reduce((acc, row) => {
      const productId = Number(row.product_id);
      const collection = collectionMap.get(Number(row.collection_id));

      if (!collection) {
        return acc;
      }

      const current = acc.get(productId) ?? [];
      current.push(collection);
      acc.set(productId, current);
      return acc;
    }, new Map<number, CatalogCollection[]>());
    const mappedDiscounts = discounts.map(mapDiscount);

    const mappedProducts = products
      .filter((row) => row.active !== false)
      .map((row) => {
        const productId = Number(row.id);
        const categoryId = row.category_id === null ? null : Number(row.category_id);
        const category = categoryId === null ? null : categoryMap.get(categoryId) ?? null;
        const productCollections = collectionsByProductId.get(productId) ?? [];
        const gallery = imagesByProductId.get(productId) ?? [];
        const basePriceSource = row.selling_price ?? row.base_price;
        const basePrice = basePriceSource === null ? null : toNumber(basePriceSource);
        const bestDiscount = basePrice === null ? null : pickBestDiscount(productId, categoryId, productCollections, mappedDiscounts, basePrice);
        const effectivePrice = basePrice === null ? null : applyDiscount(basePrice, bestDiscount);
        const image = row.primary_image_url || gallery[0]?.url || "/mystery-scoop-hero.png";
        const description = row.description?.trim() || "";
        const colours = Array.isArray(row.available_colours) ? row.available_colours.filter(Boolean) : [];
        return {
          id: productId,
          slug: row.slug?.trim() || slugify(row.name),
          name: row.view_name?.trim() || row.name,
          eyebrow: category?.name || productCollections[0]?.name || "Live catalog",
          summary: description ? summarizeDescription(description) : "",
          description,
          image,
          gallery,
          category,
          collections: productCollections,
          availableColours: colours,
          highlights: buildHighlights(category, productCollections, colours),
          basePrice,
          effectivePrice,
          priceLabel: formatCatalogPrice(effectivePrice),
          originalPriceLabel:
            basePrice !== null && effectivePrice !== null && effectivePrice < basePrice
              ? formatCatalogPrice(basePrice)
              : null,
          activeDiscount: bestDiscount,
          stockQuantity: Math.max(0, toNumber(row.stock_quantity)),
          route: `/products/${row.slug?.trim() || slugify(row.name)}`,
        } satisfies StorefrontCatalogProduct;
      });

    return mappedProducts.length > 0 ? mappedProducts : mapFallbackProducts();
  } catch {
    return mapFallbackProducts();
  }
}

export async function getStorefrontCatalogProductBySlug(
  slug: string,
): Promise<StorefrontCatalogProduct | null> {
  const products = await getStorefrontCatalogProducts();
  return products.find((product) => product.slug === slug) ?? mapFallbackProduct(slug);
}

export function filterStorefrontCatalogProducts(
  products: StorefrontCatalogProduct[],
  filters: {
    categorySlug?: string | null;
    collectionSlug?: string | null;
  },
): StorefrontCatalogProduct[] {
  const categorySlug = filters.categorySlug?.trim().toLowerCase() ?? "";
  const collectionSlug = filters.collectionSlug?.trim().toLowerCase() ?? "";

  return products.filter((product) => {
    const matchesCategory = categorySlug
      ? product.category?.slug.toLowerCase() === categorySlug
      : true;
    const matchesCollection = collectionSlug
      ? product.collections.some((collection) => collection.slug.toLowerCase() === collectionSlug)
      : true;

    return matchesCategory && matchesCollection;
  });
}

export async function getStorefrontCatalogHomeData(): Promise<StorefrontCatalogHomeData> {
  const products = await getStorefrontCatalogProducts();
  let categories = buildFacetMap(products, "category");
  let collections = buildFacetMap(products, "collection");

  if (hasCatalogConfig()) {
    try {
      const [categoryRows, collectionRows] = await Promise.all([
        fetchCategoryRows(),
        fetchCollectionRows(),
      ]);

      categories = buildCategoryFacets(categoryRows, products);
      collections = buildCollectionFacets(collectionRows.map(mapCollection), products);
    } catch {
      // Fall back to product-derived facets when a catalog metadata query fails.
    }
  }

  const collectionSections = buildCollectionSections(collections, products);

  return {
    products,
    categories,
    collections,
    collectionSections,
    featuredProducts: products.slice(0, 6),
    favouriteProducts: products.slice(0, 4),
  };
}
