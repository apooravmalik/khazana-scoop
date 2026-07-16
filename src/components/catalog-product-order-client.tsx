"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AlertCircle,
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
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

type CatalogProductOrderClientProps = {
  product: StorefrontCatalogProduct;
};

type OrderResult = {
  error?: string;
  orderId?: number;
};

export function CatalogProductOrderClient({
  product,
}: CatalogProductOrderClientProps): React.ReactElement {
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(product.image);

  const maxQuantity = Math.max(1, Math.min(10, product.stockQuantity));
  const totalPrice =
    product.effectivePrice === null
      ? product.priceLabel
      : `₹${Number(product.effectivePrice * quantity).toLocaleString("en-IN")}`;
  const galleryImages = Array.from(
    new Set([product.image, ...product.gallery.map((image) => image.url)]),
  ).slice(0, 6);
  const productFeatures =
    product.highlights.length > 0
      ? product.highlights.slice(0, 3)
      : ["Easy to carry", "Ready to ship", "Mystery collectible"];

  function updateQuantity(nextQuantity: number): void {
    setQuantity(Math.max(1, Math.min(maxQuantity, nextQuantity)));
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setOrderId(null);

    const response = await fetch("/api/catalog-orders", {
      body: JSON.stringify({
        customerAddress,
        customerName,
        customerPhone,
        productId: product.id,
        quantity,
        slug: product.slug,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const result = (await response.json().catch(() => null)) as OrderResult | null;
    setLoading(false);

    if (!response.ok || !result?.orderId) {
      setMessage(result?.error ?? "The order could not be created right now.");
      return;
    }

    setOrderId(result.orderId);
    setMessage(`Order #${result.orderId} has been created and the stock was reserved.`);
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
                {product.eyebrow || "Mystery Scoop"}
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

          <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-[#a0aaa6]">
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

          <form className="mt-6" onSubmit={submitOrder}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex h-12 w-fit items-center overflow-hidden rounded-full border-2 border-[#0fb7b2] bg-white">
                <button
                  aria-label="Decrease quantity"
                  className="grid h-full w-14 place-items-center bg-[#0fb7b2] text-white transition hover:bg-[#0ca6a1] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={quantity <= 1 || loading}
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
                  disabled={quantity >= maxQuantity || loading}
                  onClick={() => updateQuantity(quantity + 1)}
                  type="button"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>

              <button
                className="h-12 flex-1 rounded-full bg-[#0fb7b2] px-8 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#0ca6a1] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? "Reserving..." : "Reserve Product"}
              </button>
            </div>

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
                Secure Payments
              </span>
            </div>

            <div className="mt-7 grid gap-4">
              <input
                className="w-full rounded-xl border border-[#dde3df] bg-white px-5 py-4 text-sm font-semibold text-[#314f43] outline-none transition placeholder:text-[#a3b0aa] focus:border-[#2F5B4B] focus:ring-4 focus:ring-[#2F5B4B]/10"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Full Name"
                required
              />

              <input
                className="w-full rounded-xl border border-[#dde3df] bg-white px-5 py-4 text-sm font-semibold text-[#314f43] outline-none transition placeholder:text-[#a3b0aa] focus:border-[#2F5B4B] focus:ring-4 focus:ring-[#2F5B4B]/10"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Phone Number"
                required
              />

              <textarea
                className="min-h-[118px] w-full resize-none rounded-xl border border-[#dde3df] bg-white px-5 py-4 text-sm font-semibold text-[#314f43] outline-none transition placeholder:text-[#a3b0aa] focus:border-[#2F5B4B] focus:ring-4 focus:ring-[#2F5B4B]/10"
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                placeholder="Shipping Address"
                required
              />
            </div>

            <div className="mt-6 rounded-2xl border border-[#ECE9E2] bg-[#FBF8F3] p-5 text-sm text-[#697b74]">
              <div className="flex justify-between gap-4">
                <span>Total</span>
                <strong className="text-[#2F5B4B]">{totalPrice}</strong>
              </div>
              <div className="mt-3 flex justify-between gap-4">
                <span>Delivery</span>
                <strong className="text-[#2F5B4B]">5-6 Days</strong>
              </div>
              <div className="mt-3 flex justify-between gap-4">
                <span>Stock after order</span>
                <strong className="text-[#2F5B4B]">
                  {Math.max(0, product.stockQuantity - quantity)} Left
                </strong>
              </div>
            </div>

            {message ? (
              <p
                className={`mt-5 flex items-start gap-3 rounded-2xl p-4 text-sm font-bold ${
                  orderId
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {orderId ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{message}</span>
              </p>
            ) : null}
          </form>

          <div className="my-7 h-px bg-[#dfd4bd]" />

          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#2F5B4B]">
              Available offers
            </p>
            <div className="mt-4 grid overflow-hidden rounded-[22px] border border-[#cbd7d2] bg-white sm:grid-cols-[150px_1fr]">
              <div className="relative min-h-36 bg-[#f7faf8]">
                <Image
                  alt={`${product.name} offer`}
                  className="object-cover"
                  fill
                  sizes="150px"
                  src={galleryImages[1] ?? product.image}
                />
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-2xl font-black uppercase text-[#2F5B4B]">
                    Buy 5 for 799
                  </p>
                  <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#a0aaa6]">
                    Mix eligible products from this catalog and reserve them through the dashboard-backed order flow.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#0fb7b2] text-[#0fb7b2]">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
