"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-[46%_54%] lg:gap-14">
        <div>
          <div className="relative overflow-hidden rounded-[22px] border border-[#ECE9E2] bg-white shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 46vw, 100vw"
              priority
            />
            <div className="aspect-[1.02/1]" />
            <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#2F5B4B] shadow-sm">
              In stock
            </span>
          </div>

          {galleryImages.length > 1 ? (
            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {galleryImages.map((imageUrl, index) => (
                <button
                  aria-label={`Show product image ${index + 1}`}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                    selectedImage === imageUrl
                      ? "border-[#315748]"
                      : "border-[#ECE9E2] hover:border-[#9ccac1]"
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#5E8A76]">
                {product.eyebrow || "Khazana Scoop"}
              </p>
              <h1
                className="mt-3 text-4xl font-black leading-tight text-[#2F5B4B] sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-[#fff9e8] px-3 py-1 text-sm font-black text-[#2F5B4B]">
              <Star className="fill-[#f7c948] text-[#f7c948]" size={16} />
              5.0
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                className="fill-[#f7c948] text-[#f7c948]"
                key={index}
                size={18}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-[#8d9995]">
              4.9 customer rating
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#708680]">
            {product.description || product.summary}
          </p>

          <div className="mt-6 space-y-3">
            {productFeatures.map((feature) => (
              <div className="flex items-center gap-3 text-sm font-semibold text-[#516760]" key={feature}>
                <Sparkles className="text-[#f28aa2]" size={17} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="my-7 h-px bg-[#dfd4bd]" />

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black text-[#2F5B4B]">
              {product.priceLabel}
            </h2>
            {product.originalPriceLabel ? (
              <span className="text-sm font-bold text-[#a0aaa6] line-through">
                {product.originalPriceLabel}
              </span>
            ) : null}
            <span className="text-xs font-bold text-[#a0aaa6]">Inclusive of all taxes</span>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            <CheckCircle2 size={16} />
            {product.stockQuantity} Available
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex h-12 w-fit items-center overflow-hidden rounded-full border-2 border-[#0fb7b2] bg-white">
              <button
                aria-label="Decrease quantity"
                className="grid h-full w-14 place-items-center bg-[#0fb7b2] text-white transition hover:bg-[#0ca6a1] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={quantity <= 1}
                onClick={() => updateQuantity(quantity - 1)}
                type="button"
              >
                <Minus size={20} strokeWidth={3} />
              </button>
              <div className="grid h-full min-w-16 place-items-center text-lg font-black text-[#2F5B4B]">
                {quantity}
              </div>
              <button
                aria-label="Increase quantity"
                className="grid h-full w-14 place-items-center bg-[#0fb7b2] text-white transition hover:bg-[#0ca6a1] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={quantity >= maxQuantity}
                onClick={() => updateQuantity(quantity + 1)}
                type="button"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>

            <button
              className="h-12 flex-1 rounded-full border border-[#0fb7b2] bg-white px-8 text-sm font-black uppercase tracking-wide text-[#0fb7b2] transition hover:bg-[#effefd]"
              onClick={handleAddToCart}
              type="button"
            >
              Add to cart
            </button>

            <button
              className="h-12 flex-1 rounded-full bg-[#0fb7b2] px-8 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#0ca6a1]"
              onClick={handleBuyNow}
              type="button"
            >
              Buy now
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-[20px] bg-[#eefbf8] px-4 py-3 text-sm font-bold text-[#1b867f]">
              {message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold text-[#6d7d78]">
            <span className="inline-flex items-center gap-2">
              <Truck className="text-[#d7b841]" size={17} />
              Superfast Delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <PackageCheck className="text-[#d7b841]" size={17} />
              5-6 Days
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="text-[#d7b841]" size={17} />
              Guest checkout available
            </span>
          </div>

          <div className="mt-7 rounded-[24px] border border-[#d8ece7] bg-[#f5fffd] p-5">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2F5B4B]">
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
