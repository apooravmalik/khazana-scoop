import Image from "next/image";
import Link from "next/link";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";
import {
  filterStorefrontCatalogProducts,
  getStorefrontCatalogHomeData,
} from "@/lib/catalog";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    collection?: string;
    price?: string;
    q?: string;
    sort?: string;
  }>;
};

function productTag(product: StorefrontCatalogProduct): string {
  return product.category?.name || product.collections[0]?.name || product.eyebrow || "Khazana Scoop";
}

function matchesSearch(product: StorefrontCatalogProduct, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.summary,
    product.description,
    product.eyebrow,
    product.category?.name ?? "",
    ...product.collections.map((collection) => collection.name),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesPriceBand(product: StorefrontCatalogProduct, priceBand: string): boolean {
  if (!priceBand) {
    return true;
  }

  const price = product.effectivePrice;
  if (price === null) {
    return false;
  }

  if (priceBand === "under-100") {
    return price < 100;
  }

  if (priceBand === "100-500") {
    return price >= 100 && price <= 500;
  }

  if (priceBand === "500-plus") {
    return price > 500;
  }

  return true;
}

function buildProductsHref(filters: {
  category?: string;
  collection?: string;
  price?: string;
  q?: string;
  sort?: string;
}): string {
  const search = new URLSearchParams();

  if (filters.category) {
    search.set("category", filters.category);
  }

  if (filters.collection) {
    search.set("collection", filters.collection);
  }

  if (filters.price) {
    search.set("price", filters.price);
  }

  if (filters.q) {
    search.set("q", filters.q);
  }

  if (filters.sort && filters.sort !== "popularity") {
    search.set("sort", filters.sort);
  }

  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const filters = (await searchParams) ?? {};
  const searchQuery = filters.q?.trim().toLowerCase() ?? "";
  const priceFilter = filters.price?.trim() ?? "";
  const homeData = await getStorefrontCatalogHomeData();
  const filteredProducts = filterStorefrontCatalogProducts(homeData.products, {
    categorySlug: filters.category,
    collectionSlug: filters.collection,
  }).filter((product) => matchesSearch(product, searchQuery) && matchesPriceBand(product, priceFilter));
  const sort = filters.sort ?? "popularity";
  const products = [...filteredProducts].sort((left, right) => {
    if (sort === "price-asc") {
      return (left.effectivePrice ?? Number.MAX_SAFE_INTEGER) - (right.effectivePrice ?? Number.MAX_SAFE_INTEGER);
    }

    if (sort === "price-desc") {
      return (right.effectivePrice ?? 0) - (left.effectivePrice ?? 0);
    }

    if (sort === "newest") {
      return right.id - left.id;
    }

    return 0;
  });

  const activeFilterLabel = filters.collection
    ? homeData.collections.find((collection) => collection.slug === filters.collection)?.name
    : filters.category
      ? homeData.categories.find((category) => category.slug === filters.category)?.name
      : null;
  const activePriceLabel =
    priceFilter === "under-100"
      ? "Under ₹100"
      : priceFilter === "100-500"
        ? "₹100 to ₹500"
        : priceFilter === "500-plus"
          ? "Above ₹500"
          : null;
  const hasActiveFilters = Boolean(filters.category || filters.collection || searchQuery || priceFilter || sort !== "popularity");

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <StorefrontHeader currentPath="/products" />

      <div className="mx-auto w-[min(1440px,calc(100%-24px))] px-3 py-[26px] sm:w-[min(1440px,calc(100%-48px))] sm:px-6 sm:py-[34px]">
        <section className="flex min-h-[104px] items-center justify-center rounded-[28px] bg-[#fff8ec] px-6 py-6 text-center">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#245c57] sm:text-[44px]">Products</h1>
            <p className="mt-2 text-sm leading-6 text-[#7f918e]">
              {activeFilterLabel
                ? `Browsing the live ${activeFilterLabel} catalog synced from Supabase.`
                : "Browse the full Khazana Scoop range with the updated products grid layout."}
            </p>
          </div>
        </section>

        <section className="mt-[30px] overflow-x-auto overflow-y-hidden pb-2">
          <div className="flex min-w-max gap-6 px-2 pb-3 md:justify-center">
            <Link
              className="group w-[104px] text-center"
              href={buildProductsHref({
                price: priceFilter || undefined,
                q: filters.q,
                sort,
              })}
            >
              <div className={`mx-auto mb-2 grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-[18px] border-2 bg-[#ffe8dc] transition ${!filters.category && !filters.collection ? "border-[#19b8b2] shadow-[0_8px_22px_rgba(38,78,72,0.08)]" : "border-transparent group-hover:border-[#19b8b2]"}`}>
                <span className="text-[30px]">🛍️</span>
              </div>
              <span className="block min-h-[34px] text-[12px] font-bold uppercase leading-[1.35] text-[#244f4b]">All Products</span>
            </Link>

            {homeData.categories.slice(0, 5).map((category) => {
              const href = buildProductsHref({
                category: category.slug,
                price: priceFilter || undefined,
                q: filters.q,
                sort,
              });
              const active = filters.category === category.slug;

              return (
                <Link className="group w-[104px] text-center" href={href} key={category.slug}>
                  <div className={`relative mx-auto mb-2 h-[88px] w-[88px] overflow-hidden rounded-[18px] border-2 transition ${active ? "border-[#19b8b2] shadow-[0_8px_22px_rgba(38,78,72,0.08)]" : "border-transparent group-hover:border-[#19b8b2]"}`}>
                    <Image alt={category.name} className="object-cover" fill sizes="88px" src={category.image} />
                  </div>
                  <span className="block min-h-[34px] text-[12px] font-bold uppercase leading-[1.35] text-[#244f4b]">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[26px] border border-[#eee5dc] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(30,73,68,0.05)] sm:px-5">
          <form action="/products" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.8fr))_auto]" method="get">
            {filters.collection ? <input name="collection" type="hidden" value={filters.collection} /> : null}

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#244f4b]">Search</span>
              <input
                className="w-full rounded-full border border-[#eee5dc] bg-[#fffdfa] px-4 py-3 text-sm text-[#244f4b] outline-none transition focus:border-[#19b8b2]"
                defaultValue={filters.q ?? ""}
                name="q"
                placeholder="Search products, categories, or collections"
                type="search"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#244f4b]">Category</span>
              <select
                className="w-full rounded-full border border-[#eee5dc] bg-[#fffdfa] px-4 py-3 text-sm text-[#244f4b] outline-none transition focus:border-[#19b8b2]"
                defaultValue={filters.category ?? ""}
                name="category"
              >
                <option value="">All categories</option>
                {homeData.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#244f4b]">Price</span>
              <select
                className="w-full rounded-full border border-[#eee5dc] bg-[#fffdfa] px-4 py-3 text-sm text-[#244f4b] outline-none transition focus:border-[#19b8b2]"
                defaultValue={priceFilter}
                name="price"
              >
                <option value="">All prices</option>
                <option value="under-100">Under ₹100</option>
                <option value="100-500">₹100 to ₹500</option>
                <option value="500-plus">Above ₹500</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#244f4b]">Sort</span>
              <select
                className="w-full rounded-full border border-[#eee5dc] bg-[#fffdfa] px-4 py-3 text-sm text-[#244f4b] outline-none transition focus:border-[#19b8b2]"
                defaultValue={sort}
                id="sort"
                name="sort"
              >
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>

            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-1 lg:justify-end">
              <button className="min-h-[48px] flex-1 rounded-full bg-[#19b8b2] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#169f9a] lg:flex-none" type="submit">
                Apply
              </button>
              {hasActiveFilters ? (
                <Link
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-[#eee5dc] px-5 py-3 text-sm font-bold text-[#244f4b] transition hover:border-[#19b8b2] hover:text-[#19b8b2] lg:flex-none"
                  href="/products"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mb-6 mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[15px] font-bold text-[#244f4b]">
              {products.length} product{products.length === 1 ? "" : "s"} available
            </p>
            {(activeFilterLabel || activePriceLabel || searchQuery) ? (
              <p className="mt-1 text-sm leading-6 text-[#7f918e]">
                {[
                  activeFilterLabel ? `Category: ${activeFilterLabel}` : null,
                  activePriceLabel ? `Price: ${activePriceLabel}` : null,
                  searchQuery ? `Search: "${filters.q?.trim()}"` : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            ) : null}
          </div>

          <div className="text-sm text-[#7f918e]">
            Sorted by{" "}
            <span className="font-bold text-[#244f4b]">
              {sort === "newest"
                ? "Newest"
                : sort === "price-asc"
                  ? "Price: Low to High"
                  : sort === "price-desc"
                    ? "Price: High to Low"
                    : "Popularity"}
            </span>
          </div>
        </section>

        {products.length > 0 ? (
          <section className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                className="min-w-0 overflow-hidden rounded-[24px] border border-[#eee5dc] bg-white shadow-[0_3px_12px_rgba(30,73,68,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(38,78,72,0.08)]"
                href={product.route}
                key={product.slug}
              >
                <div className="relative aspect-square overflow-hidden bg-[#faf8f7]">
                  <Image alt={product.name} className="object-cover" fill sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 48vw" src={product.image} />
                </div>
                <div className="p-4 sm:p-[18px]">
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
                    {productTag(product)}
                  </span>
                  <h2 className="text-[14px] font-bold leading-[1.3] text-[#245c57] sm:text-lg">{product.name}</h2>
                  <div className="mt-4 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="text-[15px] font-extrabold text-[#245c57] sm:text-[17px]">{product.priceLabel}</span>
                    <span className="text-[11px] font-extrabold uppercase text-[#19b8b2] sm:text-[12px]">View Product</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="rounded-[24px] border border-dashed border-[#ddd2c8] bg-white px-6 py-12 text-center">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#245c57]">No products matched this filter</h2>
            <p className="mt-3 text-sm leading-7 text-[#7f918e]">
              Try switching categories or clearing the active filter to see the full live catalog again.
            </p>
          </section>
        )}
      </div>

      <StorefrontFooter />
    </main>
  );
}
