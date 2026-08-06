import Image from "next/image";
import Link from "next/link";
import { HomeCuratedProductsCarousel } from "@/components/home-curated-products-carousel";
import { HomeReelCarousel } from "@/components/home-reel-carousel";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { StorefrontCatalogHomeData } from "@/lib/catalog-types";
import {
  getPrimaryTag,
  HOME_CURATED_CAROUSEL_SLUGS,
  isHamperProduct,
  pickProductsBySlugPreference,
} from "@/lib/storefront-curation";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";

type MarketingHomeProps = {
  homeData: StorefrontCatalogHomeData;
};

const mysterySquiggle =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='12' viewBox='0 0 60 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 6C5 1 9 1 13 6s8 5 12 0 8-5 12 0 8 5 12 0 8-5 10-1' fill='none' stroke='%23f49ab0' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";

const buildSquiggle =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='12' viewBox='0 0 60 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 6C5 1 9 1 13 6s8 5 12 0 8-5 12 0 8 5 12 0 8-5 10-1' fill='none' stroke='%23b58be8' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";

export function MarketingHome({ homeData }: MarketingHomeProps): React.ReactElement {
  const heroProduct = homeData.products[0] ?? null;
  const featuredCards = homeData.products.slice(1, 3);
  const categoryCards = homeData.categories.slice(0, 6);
  const hamperProducts = homeData.products.filter(isHamperProduct).slice(0, 4);
  const trendingProducts = homeData.products.filter((product) => !isHamperProduct(product)).slice(0, 8);
  const collectionSections = homeData.collectionSections.slice(0, 3);
  const curatedCarouselProducts = pickProductsBySlugPreference(
    homeData.products.filter((product) => !isHamperProduct(product)),
    HOME_CURATED_CAROUSEL_SLUGS,
    8,
  );

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#173f3b]">
      <StorefrontHeader currentPath="/" />

      {heroProduct ? (
        <section className="px-4 pt-4 md:px-8">
          <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[36px] border border-[#eddcd3] bg-[#fff8f2]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
                <span className="inline-flex rounded-full bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#245c57] shadow-sm">
                  {heroProduct.eyebrow}
                </span>
                <h1 className="mt-5 max-w-[10ch] text-[34px] font-black leading-[0.95] tracking-[-0.04em] text-[#173f3b] sm:text-[54px] lg:text-[68px]">
                  {heroProduct.name}
                </h1>
                <p className="mt-4 max-w-[56ch] text-[13px] leading-6 text-[#71827f] sm:text-[15px] sm:leading-7">
                  {heroProduct.description || heroProduct.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-[#eadfd8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#245c57]">
                    {heroProduct.priceLabel}
                  </span>
                  <span className="rounded-full border border-[#eadfd8] bg-[#fff4ee] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#245c57]">
                    Ready to shop
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#18b8b2] px-6 text-sm font-black uppercase tracking-[0.06em] text-white transition hover:bg-[#129f99]"
                    href={heroProduct.route}
                  >
                    Shop now
                  </Link>
                  <Link
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#eadfd8] bg-white px-6 text-sm font-black uppercase tracking-[0.06em] text-[#245c57] transition hover:border-[#18b8b2] hover:text-[#18b8b2]"
                    href="/mystery-scoops"
                  >
                    Choose your scoop
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[280px] bg-[#fff2ec] sm:min-h-[320px] lg:min-h-[560px]">
                <Image
                  alt={heroProduct.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  src={heroProduct.image}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {categoryCards.length > 0 ? (
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="mb-8 text-center text-[30px] font-black tracking-[-0.03em] text-[#173f3b] md:text-[34px]">
              Shop by Category
            </h2>
            <div className="flex gap-5 overflow-x-auto pb-4 md:justify-center">
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

      <section aria-labelledby="scoop-choice-heading" className="bg-[#fcfaf7] px-4 py-14 md:px-8">
        <div className="mx-auto max-w-[1160px]">
          <header className="mx-auto mb-8 max-w-[760px] text-center md:mb-10">
            <div className="inline-flex items-center justify-center gap-2.5 sm:gap-4">
              <span aria-hidden="true" className="text-[20px] text-[#f69ab0] sm:text-[26px]">✦</span>
              <h2
                className="font-baloo text-[2.2rem] leading-[0.95] tracking-[-0.05em] text-[#173f3b] sm:text-[3rem] lg:text-[3.8rem]"
                id="scoop-choice-heading"
              >
                Choose your scoop
              </h2>
              <span aria-hidden="true" className="text-[20px] text-[#b48bea] sm:text-[26px]">✦</span>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-[#71827f] sm:text-[17px] sm:leading-8">
              Choose a surprise-filled scoop or build a box your way. Both options are easy to order
              and made for gifting, collecting, and cute little treats.
            </p>
          </header>

          <div className="grid gap-5 xl:grid-cols-2 xl:gap-7">
            <article className="overflow-hidden rounded-[30px] border border-[#f1d3da] bg-gradient-to-br from-[#fff8f8] to-[#fff2f4] shadow-[0_18px_50px_rgba(38,54,50,0.08)]">
              <div className="grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex flex-col p-6 sm:p-8 xl:p-10">
                  <p className="mb-5 inline-flex self-start rounded-full border border-[#df526f] bg-white/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#df526f]">
                    Surprise me
                  </p>
                  <h3 className="font-baloo text-[2.2rem] leading-[0.92] tracking-[-0.05em] text-[#173f3b] sm:text-[2.7rem]">
                    Mystery
                    <br />
                    Scoop
                  </h3>
                  <div
                    className="my-5 h-[10px] w-[54px] bg-contain bg-no-repeat"
                    style={{ backgroundImage: mysterySquiggle }}
                  />
                  <p className="text-[15px] leading-7 text-[#71827f] sm:text-[16px]">
                    Choose a size, share any three preferences, and let our team create a surprise mix
                    especially for you.
                  </p>
                  <ul aria-label="Mystery Scoop benefits" className="my-6 grid gap-3">
                    {[
                      "Any 3 preferences",
                      "Personalised reel option",
                      "Quick dispatch",
                    ].map((benefit) => (
                      <li className="flex items-center gap-3 text-[15px] font-bold text-[#173f3b]" key={benefit}>
                        <span
                          aria-hidden="true"
                          className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#f7a4b7] text-[13px] font-extrabold text-white"
                        >
                          ✓
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Link
                    className="mt-auto inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#173f3b] px-5 text-center text-[15px] font-extrabold text-white transition hover:bg-[#0d5148] sm:w-fit sm:px-6"
                    href="/mystery-scoop"
                  >
                    Explore Mystery Scoop <ArrowRight aria-hidden="true" size={18} />
                  </Link>
                </div>
                <div className="relative min-h-[280px] overflow-hidden xl:min-h-full">
                  <Image
                    alt="Pink Khazana Scoop mystery box filled with cute accessories and self-care products"
                    className="object-cover transition duration-500 xl:hover:scale-[1.03]"
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 50vw, 100vw"
                    src={heroProduct?.image ?? "/mystery-scoop-hero.png"}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[24%] bg-gradient-to-b from-[#fff2f4] to-transparent xl:inset-y-0 xl:left-0 xl:right-auto xl:h-auto xl:w-[26%] xl:bg-gradient-to-r" />
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-[30px] border border-[#ded4f3] bg-gradient-to-br from-[#faf7ff] to-[#f5f0ff] shadow-[0_18px_50px_rgba(38,54,50,0.08)]">
              <div className="grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex flex-col p-6 sm:p-8 xl:p-10">
                  <p className="mb-5 inline-flex self-start rounded-full border border-[#8b63d2] bg-white/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8b63d2]">
                    Choose everything
                  </p>
                  <h3 className="font-baloo text-[2.2rem] leading-[0.92] tracking-[-0.05em] text-[#173f3b] sm:text-[2.7rem]">
                    Build Your
                    <br />
                    Own Box
                  </h3>
                  <div
                    className="my-5 h-[10px] w-[54px] bg-contain bg-no-repeat"
                    style={{ backgroundImage: buildSquiggle }}
                  />
                  <p className="text-[15px] leading-7 text-[#71827f] sm:text-[16px]">
                    Pick your favourites from our collection and build a box that feels completely and
                    uniquely yours.
                  </p>
                  <ul aria-label="Build Your Own Box benefits" className="my-6 grid gap-3">
                    {[
                      "Size-based item limits",
                      "Gift note support",
                      "Personalised reel option",
                    ].map((benefit) => (
                      <li className="flex items-center gap-3 text-[15px] font-bold text-[#173f3b]" key={benefit}>
                        <span
                          aria-hidden="true"
                          className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#b894ec] text-[13px] font-extrabold text-white"
                        >
                          ✓
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Link
                    className="mt-auto inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#173f3b] px-5 text-center text-[15px] font-extrabold text-white transition hover:bg-[#0d5148] sm:w-fit sm:px-6"
                    href="/build-your-own-scoop"
                  >
                    Build My Box <ArrowRight aria-hidden="true" size={18} />
                  </Link>
                </div>
                <div className="relative min-h-[280px] overflow-hidden xl:min-h-full">
                  <Image
                    alt="Lilac Khazana Scoop build-your-own gift box filled with hand-picked products"
                    className="object-cover transition duration-500 xl:hover:scale-[1.03]"
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 50vw, 100vw"
                    src={featuredCards[0]?.image ?? heroProduct?.image ?? "/mystery-scoop-hero.png"}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[24%] bg-gradient-to-b from-[#f5f0ff] to-transparent xl:inset-y-0 xl:left-0 xl:right-auto xl:h-auto xl:w-[26%] xl:bg-gradient-to-r" />
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
          <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[30px] border border-[#eadfd8] bg-[#fffaf6] px-5 py-6 shadow-[0_12px_30px_rgba(39,78,72,0.05)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
                  More to explore
                </p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">
                  Best-loved picks
                </h2>
              </div>
              <p className="max-w-[48ch] text-sm leading-6 text-[#71827f]">
                Browse some of our most-loved finds, from tiny add-ons to giftable favourites that pair beautifully with a scoop.
              </p>
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
