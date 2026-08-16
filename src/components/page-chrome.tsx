import { StorefrontFooter, StorefrontPageHero } from "@/components/storefront-shell";

export function PageChrome({
  children,
  compactMobileHero = false,
  currentPath,
  heroAside,
  hideDefaultHeroAsideOnMobile = false,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  compactMobileHero?: boolean;
  currentPath?: string;
  heroAside?: React.ReactNode;
  hideDefaultHeroAsideOnMobile?: boolean;
  title: string;
  subtitle: string;
}): React.ReactElement {
  return (
    <main className="min-h-screen pb-10">
      <StorefrontPageHero compactOnMobile={compactMobileHero} currentPath={currentPath} hideChildrenOnMobile={hideDefaultHeroAsideOnMobile} subtitle={subtitle} title={title}>
        {heroAside ?? (
          <div className="grid w-full max-w-[340px] gap-4 sm:grid-cols-2">
            {[
              { title: "Packed with care", body: "From curated scoops to tracked delivery updates." },
              { title: "Easy to revisit", body: "Orders, profiles, and customer help stay within reach." },
            ].map((item) => (
              <div
                className="rounded-[28px] border border-white/75 bg-white/80 p-5 shadow-[0_20px_44px_rgba(124,146,140,0.14)] backdrop-blur"
                key={item.title}
              >
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#6d807a]">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#5d746d]">{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </StorefrontPageHero>
      <section className="shell mt-8">{children}</section>
      <StorefrontFooter />
    </main>
  );
}
