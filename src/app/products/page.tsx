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
    sort?: string;
  }>;
};

function productTag(product: StorefrontCatalogProduct): string {
  return product.category?.name || product.collections[0]?.name || product.eyebrow || "Khazana Scoop";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const filters = (await searchParams) ?? {};
  const homeData = await getStorefrontCatalogHomeData();
  const filteredProducts = filterStorefrontCatalogProducts(homeData.products, {
    categorySlug: filters.category,
    collectionSlug: filters.collection,
  });
  const sort = filters.sort ?? "featured";
  const products = [...filteredProducts].sort((left, right) => {
    if (sort === "price-asc") {
      return (left.effectivePrice ?? Number.MAX_SAFE_INTEGER) - (right.effectivePrice ?? Number.MAX_SAFE_INTEGER);
    }

    if (sort === "price-desc") {
      return (right.effectivePrice ?? 0) - (left.effectivePrice ?? 0);
    }

    if (sort === "name-asc") {
      return left.name.localeCompare(right.name);
    }

    return 0;
  });

  const activeFilterLabel = filters.collection
    ? homeData.collections.find((collection) => collection.slug === filters.collection)?.name
    : filters.category
      ? homeData.categories.find((category) => category.slug === filters.category)?.name
      : null;

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <StorefrontHeader currentPath="/products" />

      <div className="mx-auto w-[min(1440px,calc(100%-48px))] px-6 py-[34px] sm:px-8">
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
              href={`/products${sort !== "featured" ? `?sort=${encodeURIComponent(sort)}` : ""}`}
            >
              <div className={`mx-auto mb-2 grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-[18px] border-2 bg-[#ffe8dc] transition ${!filters.category && !filters.collection ? "border-[#19b8b2] shadow-[0_8px_22px_rgba(38,78,72,0.08)]" : "border-transparent group-hover:border-[#19b8b2]"}`}>
                <span className="text-[30px]">🛍️</span>
              </div>
              <span className="block min-h-[34px] text-[12px] font-bold uppercase leading-[1.35] text-[#244f4b]">All Products</span>
            </Link>

            {homeData.categories.slice(0, 5).map((category) => {
              const href = `/products?category=${encodeURIComponent(category.slug)}${sort !== "featured" ? `&sort=${encodeURIComponent(sort)}` : ""}`;
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

        <section className="mb-6 mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-bold text-[#244f4b]">
              {products.length} product{products.length === 1 ? "" : "s"} available
            </p>
            {activeFilterLabel ? (
              <p className="mt-1 text-sm text-[#7f918e]">Showing: {activeFilterLabel}</p>
            ) : null}
          </div>

          <form action="/products" className="flex items-center gap-3 text-[15px] text-[#244f4b]" method="get">
            {filters.category ? <input name="category" type="hidden" value={filters.category} /> : null}
            {filters.collection ? <input name="collection" type="hidden" value={filters.collection} /> : null}
            <label className="font-bold" htmlFor="sort">
              Sort
            </label>
            <select
              className="rounded-full border border-[#eee5dc] bg-white px-4 py-2 outline-none"
              defaultValue={sort}
              id="sort"
              name="sort"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
            <button className="rounded-full bg-[#19b8b2] px-4 py-2 text-sm font-bold text-white" type="submit">
              Apply
            </button>
          </form>
        </section>

        {products.length > 0 ? (
          <section className="grid gap-[26px] sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                className="overflow-hidden rounded-[24px] border border-[#eee5dc] bg-white shadow-[0_3px_12px_rgba(30,73,68,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(38,78,72,0.08)]"
                href={product.route}
                key={product.slug}
              >
                <div className="relative aspect-square overflow-hidden bg-[#faf8f7]">
                  <Image alt={product.name} className="object-cover" fill sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 100vw" src={product.image} />
                </div>
                <div className="p-[18px]">
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
                    {productTag(product)}
                  </span>
                  <h2 className="text-lg font-bold leading-[1.3] text-[#245c57]">{product.name}</h2>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[17px] font-extrabold text-[#245c57]">{product.priceLabel}</span>
                    <span className="text-[12px] font-extrabold uppercase text-[#19b8b2]">View Product</span>
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
