"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";
import { useSmoothHorizontalRail } from "@/components/use-smooth-horizontal-rail";
import { getPrimaryTag } from "@/lib/storefront-curation";

type HomeCuratedProductsCarouselProps = {
  products: StorefrontCatalogProduct[];
};

export function HomeCuratedProductsCarousel({
  products,
}: HomeCuratedProductsCarouselProps): React.ReactElement {
  const { railRef, scrollNext, scrollPrevious, setPaused } = useSmoothHorizontalRail({
    itemSelector: "[data-curated-card]",
    railId: "home-curated-products",
  });

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-end gap-3">
        <button
          aria-label="Scroll curated products left"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#eadfd8] bg-white text-[#245c57] shadow-[0_8px_20px_rgba(39,78,72,0.12)] transition hover:-translate-y-0.5"
          onClick={scrollPrevious}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="Scroll curated products right"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#eadfd8] bg-white text-[#245c57] shadow-[0_8px_20px_rgba(39,78,72,0.12)] transition hover:-translate-y-0.5"
          onClick={scrollNext}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        data-native-scroll
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        ref={railRef}
      >
        {products.map((product) => (
          <Link
            className="block w-[214px] shrink-0 rounded-[22px] border border-[#eadfd8] bg-white p-4 transition hover:-translate-y-1 sm:w-[250px]"
            data-curated-card
            href={product.route}
            key={product.slug}
          >
            <div className="relative h-48 overflow-hidden rounded-[18px] bg-[#fff4ee]">
              <Image
                alt={product.name}
                className="object-cover"
                fill
                sizes="(min-width: 640px) 250px, 214px"
                src={product.image}
              />
            </div>
            <span className="mt-4 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#19b8b2]">
              {getPrimaryTag(product)}
            </span>
            <h3 className="mt-2 text-[15px] font-bold leading-[1.3] text-[#245c57] sm:text-lg">{product.name}</h3>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-[#245c57]">{product.priceLabel}</span>
              <span className="text-[12px] font-extrabold uppercase text-[#19b8b2]">View</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
