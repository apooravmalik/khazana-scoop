import Image from "next/image";
import Link from "next/link";
import { HomeBannerCarousel } from "@/components/banner-carousel";
import { HomeCuratedProductsCarousel } from "@/components/home-curated-products-carousel";
import { HomeReelCarousel } from "@/components/home-reel-carousel";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { StorefrontCatalogHomeData } from "@/lib/catalog-types";
import {
  getPrimaryTag,
  HOME_BEST_SELLER_SLUGS,
  HOME_TRENDING_PRODUCT_SLUGS,
  isHamperProduct,
  pickProductsBySlugPreference,
} from "@/lib/storefront-curation";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";

type MarketingHomeProps = {
  homeData: StorefrontCatalogHomeData;
};

export function MarketingHome({ homeData }: MarketingHomeProps): React.ReactElement {
  const categoryCards = homeData.categories;
  const hamperProducts = homeData.products.filter(isHamperProduct).slice(0, 4);
  const nonHamperProducts = homeData.products.filter((product) => !isHamperProduct(product));
  const trendingProducts = pickProductsBySlugPreference(
    nonHamperProducts,
    HOME_TRENDING_PRODUCT_SLUGS,
    8,
  );
  const collectionSections = homeData.collectionSections.slice(0, 3);
  const curatedCarouselProducts = pickProductsBySlugPreference(
    nonHamperProducts,
    HOME_BEST_SELLER_SLUGS,
    8,
  );

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#173f3b]">
      <StorefrontHeader currentPath="/" />

      <HomeBannerCarousel />

      {categoryCards.length > 0 ? (
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="mb-8 text-center text-[30px] font-black tracking-[-0.03em] text-[#173f3b] md:text-[34px]">
              Shop by Category
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 md:flex-wrap md:justify-center">
              {categoryCards.map((category) => (
                <Link
                  className="group flex min-w-[104px] flex-col items-center text-center"
                  href={category.href}
                  key={category.slug}
                >
                  <div className="relative h-[88px] w-[88px] overflow-hidden rounded-[18px] border-2 border-transparent bg-[#fff4ee] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#18b8b2] group-hover:shadow-[0_8px_22px_rgba(38,78,72,0.08)]">
                    <Image alt={category.name} className="object-cover" fill sizes="88px" src={category.image} />
                  </div>
                  <span className="mt-3 min-h-[34px] text-[12px] font-bold uppercase leading-[1.35] text-[#245c57]">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="scoop-choice-heading" className="bg-white px-4 py-[30px] sm:px-6 sm:py-12">
        <div className="mx-auto max-w-[1120px]">
          <header className="mx-auto mb-[22px] max-w-[620px] text-center sm:mb-[30px]">
            <div className="inline-flex items-center justify-center gap-2.5">
              <span aria-hidden="true" className="text-sm text-[#f28ca6]">✦</span>
              <h2
                className="text-[25px] font-black leading-[1.05] tracking-[-0.04em] text-[#073b3d] sm:text-[38px]"
                id="scoop-choice-heading"
              >
                Choose your scoop
              </h2>
              <span aria-hidden="true" className="text-sm text-[#f28ca6]">✦</span>
            </div>
            <p className="mt-[10px] text-[13px] leading-[1.62] text-[#6b7280] sm:text-sm">
              Choose a surprise-filled scoop or build a box your way. Both options are easy to order
              and made for gifting, collecting, and cute little treats.
            </p>
          </header>

          <div className="grid gap-[14px] md:grid-cols-2 md:gap-[18px]">
            <article className="min-h-[238px] overflow-hidden rounded-[24px] border border-[#f6d9e1] bg-[#fff4f7] shadow-[0_8px_28px_rgba(68,44,54,0.07)] md:min-h-[340px]">
              <div className="grid min-h-[238px] grid-cols-[minmax(0,1fr)_118px] md:min-h-[340px] md:grid-cols-[minmax(0,1fr)_42%]">
                <div className="flex min-w-0 flex-col justify-center p-[17px_12px_17px_17px] md:p-[30px_26px]">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#d96c8c] md:text-[10px]">
                      Surprise me
                    </p>
                    <h3 className="mt-[5px] text-[22px] font-black leading-[0.98] tracking-[-0.045em] text-[#073b3d] md:text-[36px]">
                      Mystery
                      <br />
                      Scoop
                    </h3>
                    <p className="mt-[9px] text-[10.5px] leading-[1.52] text-[#64748b] md:mt-[14px] md:text-[13px] md:leading-[1.6]">
                      Choose a size, share any three preferences, and let our team create a surprise mix
                      especially for you.
                    </p>
                  </div>
                  <ul aria-label="Mystery Scoop benefits" className="mt-[11px] grid gap-[6px] md:mt-[17px] md:gap-2">
                    {[
                      "Any 3 preferences",
                      "Personalised reel option",
                      "Quick dispatch",
                    ].map((benefit) => (
                      <li className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-bold text-[#073b3d] md:gap-2 md:text-[12px]" key={benefit}>
                        <span
                          aria-hidden="true"
                          className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full bg-[#f3a0b6] text-[9px] font-extrabold text-white md:h-5 md:w-5 md:text-[10px]"
                        >
                          ✓
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Link
                    className="mt-[12px] inline-flex w-fit items-center gap-[7px] rounded-full border border-[#f28ba7] bg-[#f28ba7] px-[13px] py-[9px] text-[9px] font-extrabold uppercase tracking-[0.075em] text-[#073b3d] transition hover:-translate-y-0.5 md:mt-[19px] md:px-[18px] md:py-3 md:text-[10px]"
                    href="/mystery-scoop"
                  >
                    Explore Mystery Scoop <ArrowRight aria-hidden="true" size={12} />
                  </Link>
                </div>
                <div className="relative min-h-[238px] overflow-hidden bg-[linear-gradient(150deg,#fbdce6,#f2e3f7)] md:min-h-[340px]">
                  <Image
                    alt="Pink Khazana Scoop mystery box filled with cute accessories and self-care products"
                    className="object-cover"
                    fill
                    sizes="(min-width: 720px) 22vw, 118px"
                    src="https://kkvbkrohjnuvcojgejod.supabase.co/storage/v1/object/public/product-images/38/1785225735231-ChatGPT-Image-Jun-22-2026-05_04_29-PM-1-.webp"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-[26%] bg-gradient-to-r from-[#fff4f7]/75 to-transparent" />
                </div>
              </div>
            </article>

            <article className="min-h-[238px] overflow-hidden rounded-[24px] border border-[#e4d8f7] bg-[#f8f4ff] shadow-[0_8px_28px_rgba(68,44,54,0.07)] md:min-h-[340px]">
              <div className="grid min-h-[238px] grid-cols-[118px_minmax(0,1fr)] md:min-h-[340px] md:grid-cols-[42%_minmax(0,1fr)]">
                <div className="relative min-h-[238px] overflow-hidden bg-[linear-gradient(150deg,#e7daf7,#f7e8f5)] md:min-h-[340px]">
                  <Image
                    alt="Lilac Khazana Scoop build-your-own gift box filled with hand-picked products"
                    className="object-cover"
                    fill
                    sizes="(min-width: 720px) 22vw, 118px"
                    src="https://kkvbkrohjnuvcojgejod.supabase.co/storage/v1/object/public/product-images/90/1785936739293-ChatGPT-Image-Aug-5-2026-06_22_29-PM-1-.webp"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-[26%] bg-gradient-to-l from-[#f8f4ff]/75 to-transparent" />
                </div>
                <div className="flex min-w-0 flex-col justify-center p-[17px_17px_17px_12px] md:p-[30px_26px]">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#895acd] md:text-[10px]">
                      Choose everything
                    </p>
                    <h3 className="mt-[5px] text-[22px] font-black leading-[0.98] tracking-[-0.045em] text-[#073b3d] md:text-[36px]">
                      Build Your
                      <br />
                      Own Box
                    </h3>
                    <p className="mt-[9px] text-[10.5px] leading-[1.52] text-[#64748b] md:mt-[14px] md:text-[13px] md:leading-[1.6]">
                      Pick your favourites from our collection and build a box that feels completely and
                      uniquely yours.
                    </p>
                  </div>
                  <ul aria-label="Build Your Own Box benefits" className="mt-[11px] grid gap-[6px] md:mt-[17px] md:gap-2">
                    {[
                      "Size-based item limits",
                      "Gift note support",
                      "Personalised reel option",
                    ].map((benefit) => (
                      <li className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-bold text-[#073b3d] md:gap-2 md:text-[12px]" key={benefit}>
                        <span
                          aria-hidden="true"
                          className="grid h-[17px] w-[17px] flex-none place-items-center rounded-full bg-[#a77ae5] text-[9px] font-extrabold text-white md:h-5 md:w-5 md:text-[10px]"
                        >
                          ✓
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Link
                    className="mt-[12px] inline-flex w-fit items-center gap-[7px] rounded-full border border-[#9e72dc] bg-white px-[13px] py-[9px] text-[9px] font-extrabold uppercase tracking-[0.075em] text-[#8054c5] transition hover:-translate-y-0.5 md:mt-[19px] md:px-[18px] md:py-3 md:text-[10px]"
                    href="/build-your-own-scoop"
                  >
                    Build My Box <ArrowRight aria-hidden="true" size={12} />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {hamperProducts.length > 0 ? (
        <section className="px-4 pb-12 md:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#173f3b]">Gift Hampers</h2>
              <Link className="text-[13px] font-bold text-[#245c57] hover:underline" href="/hampers">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {hamperProducts.map((product) => (
                <article className="min-w-0" key={product.slug}>
                  <Link className="block text-inherit no-underline" href={product.route}>
                    <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#fff7f5]">
                      <Image alt={product.name} className="object-cover transition duration-300 hover:scale-[1.025]" fill sizes="(min-width: 1280px) 18vw, (min-width: 768px) 44vw, 76vw" src={product.image} />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#245c57]">
                        {product.name.toLowerCase().includes("custom") ? "Customisable" : "Gift Hamper"}
                      </span>
                    </div>
                    <div className="px-0.5 pt-3">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#7f918e]">
                        {getPrimaryTag(product)}
                      </span>
                      <h3 className="mt-1 text-[13px] font-bold leading-[1.35] text-[#173f3b] sm:text-[15px]">
                        {product.name}
                      </h3>
                      <span className="mt-1 block text-[13px] font-extrabold text-[#245c57] sm:text-sm">{product.priceLabel}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#173f3b]">Trending Right Now</h2>
            <Link className="hidden items-center gap-1 text-sm font-bold text-[#245c57] md:inline-flex" href="/products">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
            {trendingProducts.map((product) => (
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
                    {getPrimaryTag(product)}
                  </span>
                  <h3 className="text-[14px] font-bold leading-[1.3] text-[#245c57] sm:text-lg">{product.name}</h3>
                  <div className="mt-4 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="text-[15px] font-extrabold text-[#245c57] sm:text-[17px]">{product.priceLabel}</span>
                    <span className="text-[11px] font-extrabold uppercase text-[#19b8b2] sm:text-[12px]">View Product</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {collectionSections.length > 0 ? (
        <section className="px-4 pb-10 md:px-8">
          <div className="mx-auto max-w-[1160px] space-y-8">
            {collectionSections.map(({ collection, products }, index) => (
              <div
                className={`rounded-[28px] border px-5 py-6 shadow-[0_12px_30px_rgba(39,78,72,0.05)] sm:px-6 ${
                  index % 2 === 0 ? "border-[#efe4dc] bg-[#fffaf6]" : "border-[#e6def3] bg-[#fbf9ff]"
                }`}
                key={collection.slug}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">Shop the collection</p>
                    <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">{collection.name}</h2>
                    <p className="mt-2 max-w-[58ch] text-sm leading-7 text-[#71827f]">
                      {collection.description || `Explore favourite finds from the ${collection.name} collection and discover pieces that match your mood, style, or gifting plans.`}
                    </p>
                  </div>
                  <Link className="text-sm font-bold text-[#245c57] hover:underline" href={collection.href}>
                    Shop collection →
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {products.slice(0, 3).map((product) => (
                    <Link
                      className="min-w-0 rounded-[22px] border border-[#eadfd8] bg-white p-3.5 transition hover:-translate-y-1 sm:p-4"
                      href={product.route}
                      key={product.slug}
                    >
                      <div className="relative h-36 overflow-hidden rounded-[18px] bg-[#fff4ee] sm:h-48">
                        <Image alt={product.name} className="object-cover" fill sizes="(min-width: 1024px) 28vw, 48vw" src={product.image} />
                      </div>
                      <h3 className="mt-4 text-[15px] font-black tracking-[-0.03em] text-[#173f3b] sm:text-xl">{product.name}</h3>
                      <p className="mt-2 text-[13px] leading-5 text-[#71827f] sm:text-sm sm:leading-6">{product.summary}</p>
                      <span className="mt-4 block text-[13px] font-extrabold text-[#245c57] sm:text-sm">{product.priceLabel}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {curatedCarouselProducts.length > 0 ? (
        <section className="px-4 pb-10 md:px-8">
          <div className="mx-auto max-w-[1160px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">
                  Best sellers
                </h2>
              </div>
              <Link className="hidden items-center gap-1 text-sm font-bold text-[#245c57] md:inline-flex" href="/products">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <HomeCuratedProductsCarousel products={curatedCarouselProducts} />
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-10 md:px-8">
        <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[30px] border border-[#eadfd8] bg-[linear-gradient(135deg,#fff5f8,#fdfcff)] px-5 py-6 shadow-[0_12px_30px_rgba(39,78,72,0.05)] sm:px-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
                See it in real life
              </p>
              <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">
                Watch the scoop experience
              </h2>
            </div>
          </div>

          <HomeReelCarousel />
        </div>
      </section>

      <StorefrontFooter />
    </main>
  );
}
