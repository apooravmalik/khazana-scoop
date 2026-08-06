"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound, MapPin, Search, ShoppingBag, X } from "lucide-react";
import { useCatalogCart } from "@/hooks/use-catalog-cart";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Mystery Scoop", href: "/mystery-scoop" },
      { label: "Build your scoop", href: "/build-your-own-scoop" },
      { label: "Hampers", href: "/hampers" },
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

export function StorefrontLogo({
  priority = false,
  widthClassName = "w-[152px] sm:w-[220px] lg:w-[320px]",
}: {
  priority?: boolean;
  widthClassName?: string;
} = {}): React.ReactElement {
  return (
    <Link
      aria-label="Khazana Scoop home"
      className={`inline-flex items-center ${widthClassName} transition-transform duration-200 hover:scale-[1.01]`}
      href="/"
    >
      <Image
        alt="Khazana Scoop"
        className="h-auto w-full"
        height={166}
        priority={priority}
        src="/brand/khazana-scoop-logo.png"
        width={1216}
      />
    </Link>
  );
}

export function StorefrontHeader({
  currentPath,
}: {
  currentPath?: string;
}): React.ReactElement {
  const { itemCount } = useCatalogCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { href: "/", label: "HOME", matchPaths: ["/"] },
    { href: "/products", label: "PRODUCTS", matchPaths: ["/products"] },
    {
      href: "/mystery-scoops",
      label: "SCOOP BUILDER",
      matchPaths: ["/mystery-scoops", "/mystery-scoop", "/build-your-own-scoop"],
    },
    { href: "/hampers", label: "HAMPERS", matchPaths: ["/hampers"] },
    { href: "/about", label: "ABOUT US", matchPaths: ["/about"] },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#F5CBCB] px-3 py-2 text-[11px] font-poppins font-semibold tracking-wide text-[#1e293b] sm:gap-2 md:gap-4 md:text-xs">
        <span>Free shipping ₹500+</span>
        <span>•</span>
        <span>PAN India</span>
        <span>•</span>
        <span>5-6 days delivery</span>
      </div>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#FFE2E2] bg-white/95 px-3 py-3 backdrop-blur-sm sm:px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:flex-[0_0_auto] lg:gap-5">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-controls="storefront-mobile-menu"
            className="rounded-full border border-[#FFE2E2] p-2 text-[#1e293b] transition-colors hover:bg-[#FBEFEF] lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? (
              <X size={22} strokeWidth={2.4} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <StorefrontLogo priority widthClassName="w-[150px] sm:w-[198px] md:w-[242px] lg:w-[275px] xl:w-[319px]" />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-start gap-5 px-8 font-baloo text-sm font-medium text-[#1e293b] lg:flex xl:gap-7 xl:px-10 xl:text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition-colors hover:text-[#C5B3D3] ${item.matchPaths.includes(currentPath ?? "") ? "text-[#C5B3D3]" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 text-[#1e293b] sm:gap-4 lg:flex-[0_0_auto] lg:gap-6">
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
      {menuOpen ? (
        <div className="sticky top-[73px] z-40 lg:hidden">
          <button
            aria-label="Close mobile menu overlay"
            className="fixed inset-0 bg-[#1e293b]/20"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div
            className="relative mx-3 mt-3 overflow-hidden rounded-[28px] border border-[#FFE2E2] bg-white shadow-[0_24px_60px_rgba(30,41,59,0.16)]"
            id="storefront-mobile-menu"
          >
            <nav aria-label="Mobile navigation" className="grid gap-2 p-3">
              {navItems.map((item) => {
                const isActive = item.matchPaths.includes(currentPath ?? "");
                return (
                  <Link
                    key={item.href}
                    className={`rounded-[20px] px-4 py-3 font-baloo text-lg tracking-[-0.03em] transition-colors ${
                      isActive ? "bg-[#F5CBCB] text-[#1e293b]" : "bg-[#FBEFEF] text-[#1e293b] hover:bg-[#F5CBCB]"
                    }`}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="grid grid-cols-2 gap-3 border-t border-[#FFE2E2] bg-[#FFF9F6] p-3">
              <Link
                className="rounded-[18px] border border-[#FFE2E2] bg-white px-4 py-3 text-center font-poppins text-sm font-semibold text-[#1e293b] transition-colors hover:bg-[#FBEFEF]"
                href="/account"
                onClick={() => setMenuOpen(false)}
              >
                Account
              </Link>
              <Link
                className="rounded-[18px] border border-[#FFE2E2] bg-white px-4 py-3 text-center font-poppins text-sm font-semibold text-[#1e293b] transition-colors hover:bg-[#FBEFEF]"
                href="/cart"
                onClick={() => setMenuOpen(false)}
              >
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function StorefrontFooter(): React.ReactElement {
  return (
    <footer className="mt-16 border-t border-[#FFE2E2] bg-[#FBEFEF]">
      <div className="shell py-12 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="grid gap-8 rounded-[34px] border border-[#FFE2E2] bg-white px-6 py-8 shadow-sm lg:grid-cols-[1.1fr_1.4fr] lg:px-10">
          <div className="space-y-5">
            <StorefrontLogo widthClassName="w-[220px] sm:w-[250px] lg:w-[300px]" />
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
          <div className="grid gap-6 px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_0.78fr] lg:px-10 lg:py-12">
            <div className="space-y-5">
              <h1
                className="max-w-[12ch] text-[2.75rem] leading-[0.95] font-baloo tracking-[-0.05em] text-[#1e293b] sm:text-6xl lg:text-7xl"
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
