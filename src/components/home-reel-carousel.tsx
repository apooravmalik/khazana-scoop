"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import * as React from "react";
import { HOME_REEL_PLACEHOLDERS } from "@/lib/storefront-curation";
import { useSmoothHorizontalRail } from "@/components/use-smooth-horizontal-rail";

const repeatedReelCards = [...HOME_REEL_PLACEHOLDERS, ...HOME_REEL_PLACEHOLDERS];

export function HomeReelCarousel(): React.ReactElement {
  const { railRef, scrollNext, scrollPrevious, setPaused } = useSmoothHorizontalRail({
    autoAdvanceMs: 3200,
    itemSelector: "[data-reel-card]",
    loopAtHalf: true,
    railId: "home-reels",
  });

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-end gap-3">
        <button
          aria-label="Scroll reels left"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#eadfd8] bg-white text-[#245c57] shadow-[0_8px_20px_rgba(39,78,72,0.12)] transition hover:-translate-y-0.5"
          onClick={scrollPrevious}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="Scroll reels right"
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
        {repeatedReelCards.map((card, index) => (
          <article
            className="flex w-[220px] shrink-0 flex-col rounded-[26px] border border-white/70 bg-white/85 p-3 shadow-[0_16px_34px_rgba(39,78,72,0.09)]"
            data-reel-card
            key={`${card.id}-${index}`}
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#ffe7ef_0%,#f5efff_55%,#e5f8f6_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffffcc_0%,transparent_36%)]" />
              <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#245c57]">
                  {card.label}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#173f3b] text-white shadow-sm">
                  <Play fill="currentColor" size={15} />
                </span>
              </div>
              <div className="absolute inset-x-4 bottom-4">
                <h3 className="text-[22px] font-black leading-[1.02] tracking-[-0.04em] text-[#173f3b]">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#4e6460]">{card.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
