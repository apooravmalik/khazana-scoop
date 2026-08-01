import Image from "next/image";
import { ScoopBuilderClient } from "@/components/scoop-builder-client";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";

const infoCards = [
  {
    body: "Tell us the type of products or theme you would enjoy.",
    title: "Any 3 preferences",
  },
  {
    body: "Get a personalised packing Reel featuring your name on Instagram.",
    title: "Personalised Instagram Reel +₹50",
  },
  {
    body: "Dispatched in 1-2 days. Delivery usually takes 5-6 days.",
    title: "Quick dispatch",
  },
];

export default function MysteryScoopPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#fffaf5]">
      <StorefrontHeader currentPath="/mystery-scoop" />

      <div className="mx-auto w-[min(1160px,calc(100%-28px))] px-4 py-7">
        <section className="grid gap-6 rounded-[28px] border border-[#efd9df] bg-[linear-gradient(135deg,#fff0f4,#fff9fb)] px-6 py-8 shadow-[0_14px_36px_rgba(39,78,72,0.09)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <h1 className="text-[42px] font-black leading-[1.04] tracking-[-0.04em] text-[#173f3b] sm:text-[58px]">
              Mystery Scoop
            </h1>
            <p className="mt-3 max-w-[620px] text-[15px] leading-[1.7] text-[#71827f]">
              Choose your scoop size, share any three preferences, and let us create a surprise mix especially for you.
            </p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[22px] bg-white">
            <Image
              alt="Khazana Mystery Scoop"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 36vw, 100vw"
              src="/mystery-scoop-hero.png"
            />
          </div>
        </section>

        <section className="mt-[18px] grid gap-[14px] md:grid-cols-3">
          {infoCards.map((card) => (
            <article className="rounded-[16px] border border-[#eadfd8] bg-white p-[17px]" key={card.title}>
              <strong className="block text-sm font-extrabold text-[#173f3b]">{card.title}</strong>
              <span className="mt-1 block text-[12px] leading-[1.45] text-[#71827f]">{card.body}</span>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <ScoopBuilderClient variant="mystery" />
        </section>
      </div>

      <StorefrontFooter />
    </main>
  );
}
