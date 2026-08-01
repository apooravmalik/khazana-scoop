import Image from "next/image";
import Link from "next/link";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";
import { getStorefrontCatalogHomeData } from "@/lib/catalog";
import { getPrimaryTag, isHamperProduct } from "@/lib/storefront-curation";

export const dynamic = "force-dynamic";

export default async function HampersPage(): Promise<React.ReactElement> {
  const homeData = await getStorefrontCatalogHomeData();
  const hamperProducts = homeData.products.filter(isHamperProduct);

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <StorefrontHeader currentPath="/hampers" />

      <div className="mx-auto w-[min(1440px,calc(100%-48px))] px-6 py-[34px] sm:px-8">
        <section className="flex min-h-[104px] items-center justify-center rounded-[28px] bg-[#fff4ee] px-6 py-6 text-center">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#245c57] sm:text-[44px]">
              Hampers
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#7f918e]">
              Gifting-ready hampers pulled from the live catalog, with room for custom and seasonal drops.
            </p>
          </div>
        </section>

        {hamperProducts.length > 0 ? (
          <section className="mt-8 grid gap-[26px] sm:grid-cols-2 xl:grid-cols-4">
            {hamperProducts.map((product) => (
              <Link
                className="overflow-hidden rounded-[24px] border border-[#eee5dc] bg-white shadow-[0_3px_12px_rgba(30,73,68,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_22px_rgba(38,78,72,0.08)]"
                href={product.route}
                key={product.slug}
              >
                <div className="relative aspect-square overflow-hidden bg-[#faf8f7]">
                  <Image
                    alt={product.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 100vw"
                    src={product.image}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#245c57]">
                    {product.name.toLowerCase().includes("custom") ? "Customisable" : "Gift Hamper"}
                  </span>
                </div>
                <div className="p-[18px]">
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
                    {getPrimaryTag(product)}
                  </span>
                  <h2 className="text-lg font-bold leading-[1.3] text-[#245c57]">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#71827f]">{product.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[17px] font-extrabold text-[#245c57]">{product.priceLabel}</span>
                    <span className="text-[12px] font-extrabold uppercase text-[#19b8b2]">View Product</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-[24px] border border-dashed border-[#ddd2c8] bg-white px-6 py-12 text-center">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#245c57]">
              No hampers are live right now
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#7f918e]">
              As soon as hamper products are active in Supabase, they will show up here automatically.
            </p>
          </section>
        )}
      </div>

      <StorefrontFooter />
    </main>
  );
}
