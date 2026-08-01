"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCatalogCart } from "@/hooks/use-catalog-cart";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

type CatalogProductOrderClientProps = {
  product: StorefrontCatalogProduct;
};

export function CatalogProductOrderClient({
  product,
}: CatalogProductOrderClientProps): React.ReactElement {
  const router = useRouter();
  const { addItem } = useCatalogCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>(product.image);

  const maxQuantity = Math.max(1, Math.min(10, product.stockQuantity));
  const galleryImages = useMemo(
    () => Array.from(new Set([product.image, ...product.gallery.map((image) => image.url)])).slice(0, 6),
    [product.gallery, product.image],
  );
  const productFeatures =
    product.highlights.length > 0
      ? product.highlights.slice(0, 3)
      : ["Easy to carry", "Ready to ship", "Mystery collectible"];

  function updateQuantity(nextQuantity: number): void {
    setQuantity(Math.max(1, Math.min(maxQuantity, nextQuantity)));
  }

  function handleAddToCart(): void {
    addItem(product.id, product.slug, quantity);
    setMessage(`${product.name} was added to your cart.`);
  }

  function handleBuyNow(): void {
    addItem(product.id, product.slug, quantity);
    router.push("/checkout");
  }

  return (
    <section className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] lg:gap-[54px]">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[28px] border border-[#eee5dd] bg-white">
            <Image
              alt={product.name}
              className="object-cover object-center"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={selectedImage}
            />
            <div className="aspect-[1/1] min-h-[380px] lg:min-h-[540px]" />
            <span className="absolute right-[18px] top-[18px] rounded-full border border-[#dce8e5] bg-white/95 px-[14px] py-[9px] text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#1f5752]">
              In stock
            </span>
          </div>

          {galleryImages.length > 1 ? (
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((imageUrl, index) => (
                <button
                  aria-label={`Show product image ${index + 1}`}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border-2 bg-white transition ${
                    selectedImage === imageUrl
                      ? "border-[#18b8b2]"
                      : "border-[#eadfce] hover:border-[#18b8b2]"
                  }`}
                  key={imageUrl}
                  onClick={() => setSelectedImage(imageUrl)}
                  type="button"
                >
                  <Image
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={imageUrl}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pt-2">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#18b8b2]">
            {product.eyebrow || "Khazana Scoop"}
          </p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.08] tracking-[-0.04em] text-[#1f5752] sm:text-[48px]">
            {product.name}
          </h1>
          <p className="mt-[14px] text-[15px] leading-[1.7] text-[#8c9997]">
            {product.description || product.summary}
          </p>

          <ul className="mt-5 grid gap-3">
            {productFeatures.map((feature) => (
              <li className="flex items-start gap-[11px] text-[15px] leading-[1.45] text-[#496b67]" key={feature}>
                <Sparkles className="mt-0.5 text-[#ff7196]" size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="my-7 h-px bg-[#eadfce]" />

          <div className="mb-5 flex flex-wrap items-baseline gap-3">
            <span className="text-[27px] font-extrabold text-[#1f5752]">{product.priceLabel}</span>
            {product.originalPriceLabel ? (
              <span className="text-sm text-[#a0a7a6] line-through">{product.originalPriceLabel}</span>
            ) : null}
            <span className="text-[13px] text-[#a0a7a6]">Inclusive of all taxes</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#dcf8e9] px-[13px] py-[9px] text-[13px] font-bold text-[#188d57]">
            <CheckCircle2 size={16} />
            {product.stockQuantity} Available
          </div>

          <div className="mt-6 grid gap-[14px] sm:grid-cols-[145px_1fr] sm:items-stretch">
            <div className="grid min-h-[48px] grid-cols-[44px_1fr_44px] items-center rounded-full border-2 border-[#14b8b4] bg-white p-[3px]">
              <button
                aria-label="Decrease quantity"
                className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#14b8b4] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={quantity <= 1}
                onClick={() => updateQuantity(quantity - 1)}
                type="button"
              >
                <Minus size={20} strokeWidth={2.7} />
              </button>
              <div className="text-center text-base font-extrabold text-[#1f5752]">{quantity}</div>
              <button
                aria-label="Increase quantity"
                className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#14b8b4] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={quantity >= maxQuantity}
                onClick={() => updateQuantity(quantity + 1)}
                type="button"
              >
                <Plus size={20} strokeWidth={2.7} />
              </button>
            </div>

            <button
              className="min-h-[48px] rounded-full bg-[#14b8b4] px-8 text-[14px] font-extrabold tracking-[0.02em] text-white transition hover:brightness-95"
              onClick={handleAddToCart}
              type="button"
            >
              Add to cart
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-[18px] bg-[#eefbf8] px-4 py-3 text-sm font-bold text-[#1b867f]">
              {message}
            </p>
          ) : null}

          <button
            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-[#14b8b4]"
            onClick={handleBuyNow}
            type="button"
          >
            Buy now
            <ArrowUpRight size={16} />
          </button>

          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-4 text-[13px] text-[#52716e]">
            <span className="inline-flex items-center gap-2">
              <span className="text-base font-black text-[#e9b319]">✓</span>
              Superfast delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-base font-black text-[#e9b319]">✓</span>
              Easy returns support
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-base font-black text-[#e9b319]">✓</span>
              Guest checkout available
            </span>
          </div>

          <div className="mt-7 rounded-[24px] border border-[#d8ece7] bg-[#f5fffd] p-5">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#1f5752]">
              Payment and guest checkout
            </p>
            <p className="mt-3 text-sm leading-7 text-[#627771]">
              Shoppers can now add catalog products to cart, go through Razorpay without registering, and still have their name, email, phone number, address, and payment reference stored with the order.
            </p>
            <button
              className="mt-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-[#0fb7b2]"
              onClick={() => router.push("/checkout")}
              type="button"
            >
              Go to checkout
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
