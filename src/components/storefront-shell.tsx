"use client";

import Link from "next/link";
import { CircleUserRound, MapPin, Search, ShoppingBag } from "lucide-react";
import { useCatalogCart } from "@/hooks/use-catalog-cart";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Mystery scoops", href: "/mystery-scoops" },
      { label: "Products", href: "/products" },
      { label: "Lucky capsules", href: "/products/lucky-capsules" },
      { label: "Charm mixes", href: "/products/charm-mixes" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track orders", href: "/tracking" },
      { label: "Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Inside Mystery Scoop",
    links: [
      { label: "About", href: "/about" },
      { label: "Profile", href: "/profile" },
      { label: "Orders", href: "/orders" },
      { label: "Admin", href: "/admin" },
    ],
  },
];

export function StorefrontLogo(): React.ReactElement {
  return (
    <Link
      aria-label="Khazana Scoop home"
      className="inline-flex items-center font-baloo text-3xl font-bold tracking-tight text-[#C5B3D3] hover:text-[#1e293b] transition-colors"
      href="/"
    >
      KHAZANA SCOOP
    </Link>
  );
}

export function StorefrontHeader({
  currentPath,
}: {
  currentPath?: string;
}): React.ReactElement {
  const { itemCount } = useCatalogCart();

  return (
    <>
      <div className="bg-[#F5CBCB] text-[#1e293b] py-2 flex justify-center items-center gap-2 md:gap-4 text-xs font-poppins font-semibold tracking-wide">
        <span>Free Shipping</span>
        <span>•</span>
        <span>PAN India</span>
        <span>•</span>
        <span>5-6 days delivery</span>
      </div>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#FFE2E2] py-4 px-4 md:px-8 flex items-center justify-between">
        <div className="flex-1 lg:hidden">
          <button className="p-2 text-[#1e293b]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
        
        <nav className="hidden lg:flex flex-1 items-center gap-8 font-baloo text-lg font-medium text-[#1e293b]">
          {[
            { label: 'HOME', href: '/' },
            { label: 'PRODUCTS', href: '/products' },
            { label: 'MYSTERY SCOOPS', href: '/mystery-scoops' },
            { label: 'ABOUT US', href: '/about' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`transition-colors hover:text-[#C5B3D3] ${currentPath === item.href ? 'text-[#C5B3D3]' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 flex justify-center lg:flex-none">
          <StorefrontLogo />
        </div>

        <div className="flex-1 flex justify-end items-center gap-4 lg:gap-6 text-[#1e293b]">
          <Link href="/products" aria-label="Search products" className="hover:text-[#C5B3D3] transition-colors">
            <Search size={22} strokeWidth={2.5} />
          </Link>
          <Link href="/account" aria-label="Open account" className="hidden md:block hover:text-[#C5B3D3] transition-colors">
            <CircleUserRound size={22} strokeWidth={2.5} />
          </Link>
          <Link href="/cart" aria-label="Open cart" className="hover:text-[#C5B3D3] transition-colors relative">
            <ShoppingBag size={22} strokeWidth={2.5} />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#0fb7b2] px-1 text-[10px] font-black text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </header>
    </>
  );
}

export function StorefrontFooter(): React.ReactElement {
  return (
    <footer className="mt-16 border-t border-[#FFE2E2] bg-[#FBEFEF]">
      <div className="shell py-12 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="grid gap-8 rounded-[34px] border border-[#FFE2E2] bg-white px-6 py-8 shadow-sm lg:grid-cols-[1.1fr_1.4fr] lg:px-10">
          <div className="space-y-5">
            <StorefrontLogo />
            <div className="space-y-3 font-poppins text-sm leading-7 text-[#1e293b]/70">
              <p>
                A collectible-first scoop shop with clear tracking, playful reveals, and customer-friendly add-ons.
              </p>
              <p>
                Keep an eye on packing updates, build a brighter cart, and revisit your favorite surprise mix any time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-poppins font-bold text-[#C5B3D3]">
              <Link className="px-4 py-2 bg-[#FBEFEF] rounded-full hover:bg-[#C5B3D3] hover:text-white transition-colors" href="/mystery-scoops">
                Start a scoop
              </Link>
              <Link className="px-4 py-2 bg-[#FBEFEF] rounded-full hover:bg-[#C5B3D3] hover:text-white transition-colors" href="/tracking">
                Track orders
              </Link>
              <Link className="px-4 py-2 bg-[#FBEFEF] rounded-full hover:bg-[#C5B3D3] hover:text-white transition-colors" href="/contact">
                Get support
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h2 className="font-baloo text-lg font-bold text-[#1e293b]">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link className="font-poppins text-sm text-[#1e293b]/70 transition-colors hover:text-[#C5B3D3]" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 font-poppins text-sm text-[#1e293b]/50 sm:flex-row sm:items-center sm:justify-between px-4">
          <p>© {new Date().getFullYear()} Khazana Scoop. Small surprises, packed with care.</p>
          <Link className="inline-flex items-center gap-2 font-semibold text-[#C5B3D3] hover:text-[#1e293b] transition-colors" href="/contact">
            <MapPin size={16} strokeWidth={2.2} />
            Find Khazana Scoop support
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function StorefrontPageHero({
  children,
  currentPath,
  subtitle,
  title,
}: {
  children?: React.ReactNode;
  currentPath?: string;
  subtitle: string;
  title: string;
}): React.ReactElement {
  return (
    <>
      <StorefrontHeader currentPath={currentPath} />
      <section className="shell pt-8">
        <div className="overflow-hidden rounded-[34px] border border-[#FFE2E2] bg-[#FBEFEF] shadow-sm">
          <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1fr_0.78fr] lg:px-10 lg:py-12">
            <div className="space-y-5">
              <h1
                className="max-w-[12ch] text-5xl leading-[0.95] font-baloo tracking-[-0.05em] text-[#1e293b] sm:text-6xl lg:text-7xl"
              >
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 font-poppins text-[#1e293b]/70 sm:text-lg">{subtitle}</p>
            </div>
            <div className="flex items-end justify-start lg:justify-end">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}

export function StorefrontSectionTitle({
  action,
  children,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="text-[2rem] font-baloo uppercase tracking-[-0.03em] text-[#1e293b] sm:text-[2.35rem]">
        {children}
      </h2>
      {action}
    </div>
  );
}
