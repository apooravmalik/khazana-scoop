import Image from "next/image";
import { ScoopBuilderClient } from "@/components/scoop-builder-client";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";

const benefits = [
  {
    body: "Every Mystery Scoop includes a fresh mix of cute products.",
    icon: "✦",
    title: "Different every time",
  },
  {
    body: "Add a packing video to your order for ₹50 extra.",
    icon: "▻",
    title: "Packing video available",
  },
  {
    body: "Your order will be dispatched within 1-2 days.",
    icon: "✓",
    title: "Quick dispatch",
  },
];

export default function MysteryScoopsPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#fffaf5]">
      <StorefrontHeader currentPath="/mystery-scoops" />

      <div className="mx-auto w-[min(1160px,calc(100%-28px))] px-4 py-7">
        <section className="grid gap-6 rounded-[28px] border border-[#eadfd8] bg-[linear-gradient(135deg,#fff7f5,#fffdfb)] px-6 py-8 shadow-[0_14px_36px_rgba(39,78,72,0.09)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <h1 className="text-[42px] font-black leading-[1.04] tracking-[-0.04em] text-[#173f3b] sm:text-[58px]">
              Choose Your Khazana
            </h1>
            <p className="mt-3 max-w-[620px] text-[15px] leading-[1.7] text-[#71827f]">
              Pick a surprise-filled Mystery Scoop or build a personalised box with products chosen by you.
            </p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[22px] bg-white">
            <Image
              alt="Khazana Scoop products"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 36vw, 100vw"
              src="/mystery-scoop-hero.png"
            />
          </div>
        </section>

        <section className="mt-[18px] grid gap-[14px] md:grid-cols-3" aria-label="Why shop">
          {benefits.map((benefit) => (
            <article className="rounded-[18px] border border-[#eadfd8] bg-white p-[17px] shadow-[0_14px_36px_rgba(39,78,72,0.06)]" key={benefit.title}>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#fff7f9] text-lg font-black text-[#18b8b2]">
                {benefit.icon}
              </div>
              <h2 className="mt-4 text-lg font-black tracking-[-0.03em] text-[#173f3b]">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#71827f]">{benefit.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <ScoopBuilderClient variant="combined" />
        </section>
      </div>

      <StorefrontFooter />
    </main>
  );
}
