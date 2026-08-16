import Image from "next/image";
import { PageChrome } from "@/components/page-chrome";

const waysToShop = [
  {
    title: "Mystery Scoops",
    body: "Choose a scoop size and share the preferences available for it. Each scoop is a surprise, curated around the selected category and what is in stock.",
  },
  {
    title: "Build Your Own Boxes",
    body: "Put together a box that feels personal by choosing products for birthdays, small celebrations, thank-yous, or a treat for yourself.",
  },
  {
    title: "Individual Products",
    body: "Browse jewellery, hair accessories, stationery, beauty and self-care finds, candles, soaps, keychains, charms, festive products, and more.",
  },
  {
    title: "Gifting Hampers",
    body: "Pick a ready-to-gift hamper or create a customised gifting moment for the people you want to celebrate.",
  },
];

export default function AboutPage(): React.ReactElement {
  return (
    <PageChrome
      currentPath="/about"
      heroAside={
        <div className="grid w-full max-w-[380px] gap-4">
          <div className="relative min-h-[230px] overflow-hidden rounded-[30px] border border-white/75 bg-white/70 shadow-[0_20px_44px_rgba(124,146,140,0.14)]">
            <Image
              alt="A colourful Khazana Scoop gift assortment"
              className="object-cover"
              fill
              loading="eager"
              priority
              sizes="380px"
              src="/mystery-scoop-hero.png"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Curated", body: "Playful finds selected for a feel-good unboxing." },
              { title: "Gift-ready", body: "Thoughtful products for everyday treats and special moments." },
            ].map((item) => (
              <div className="rounded-[26px] border border-white/75 bg-white/84 p-5 shadow-[0_20px_44px_rgba(124,146,140,0.14)] backdrop-blur" key={item.title}>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#6d807a]">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#5d746d]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      }
      title="About Khazana Scoop"
      subtitle="A playful gifting and lifestyle store for surprises, thoughtful boxes, and little moments worth celebrating."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">Our store</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#32524b]" style={{ fontFamily: "var(--font-display)" }}>
            Gifting should feel as joyful to choose as it does to receive.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#627771]">
            Khazana Scoop brings together mystery scoops, build-your-own boxes, individual products, and gifting hampers in one cheerful place. Whether you are picking a surprise for yourself or preparing a present for someone else, we want every order to feel considered and fun.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {waysToShop.map((item) => (
              <section className="rounded-[28px] border border-[#ece3d9] bg-[#fffdfa] p-5" key={item.title}>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#667b75]">{item.body}</p>
              </section>
            ))}
          </div>
        </section>

        <aside className="rounded-[32px] border border-[#ece3d9] bg-[linear-gradient(135deg,#fff9ef_0%,#f1fbfb_100%)] p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">The Khazana Scoop promise</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#32524b]" style={{ fontFamily: "var(--font-display)" }}>
            Small treasures, packed with care.
          </h2>
          <p className="mt-4 text-base leading-8 text-[#627771]">
            We make reasonable efforts to show products clearly and pack every order carefully. Mystery Scoop contents remain a surprise, while customised boxes and hampers are prepared from the selections you share with us.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "Delivery available across serviceable PIN codes in India.",
              "Free shipping on orders of ₹500 or above; ₹80 below ₹500.",
              "Customer support is here for order and delivery questions.",
            ].map((item) => (
              <div className="rounded-[22px] bg-white/84 p-4 text-sm font-bold text-[#35534d] shadow-[0_14px_34px_rgba(118,140,134,0.10)]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageChrome>
  );
}
