"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalogCart } from "@/hooks/use-catalog-cart";
import { calculateCatalogShippingPaise } from "@/lib/catalog-pricing";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

type CatalogCartClientProps = {
  mode: "cart" | "checkout";
  products: StorefrontCatalogProduct[];
};

type RazorpayIntentResponse = {
  amountPaise: number;
  checkoutId: string;
  currency: string;
  keyId: string;
  razorpayOrderId: string;
  supabaseOrderId: number;
};

type RazorpayVerifyResponse = {
  orderId?: number | null;
  success?: boolean;
};

type CartDisplayItem = {
  lineTotalPaise: number;
  product: StorefrontCatalogProduct;
  quantity: number;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function formatPaise(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function getProductCartItems(
  cartItems: ReturnType<typeof useCatalogCart>["items"],
  products: StorefrontCatalogProduct[],
): CartDisplayItem[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return cartItems
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product || product.effectivePrice === null) {
        return null;
      }

      const unitPricePaise = Math.round(product.effectivePrice * 100);

      return {
        product,
        quantity: Math.min(item.quantity, Math.max(1, product.stockQuantity)),
        lineTotalPaise: unitPricePaise * Math.min(item.quantity, Math.max(1, product.stockQuantity)),
      } satisfies CartDisplayItem;
    })
    .filter((item): item is CartDisplayItem => Boolean(item));
}

export function CatalogCartClient({
  mode,
  products,
}: CatalogCartClientProps): React.ReactElement {
  const { clearCart, items, removeItem, setQuantity } = useCatalogCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const cartProducts = useMemo(() => getProductCartItems(items, products), [items, products]);
  const subtotalPaise = useMemo(
    () => cartProducts.reduce((total, item) => total + item.lineTotalPaise, 0),
    [cartProducts],
  );
  const shippingPaise = calculateCatalogShippingPaise(subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;

  async function startRazorpayCheckout(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccessOrderId(null);

    if (!window.Razorpay || !razorpayReady) {
      setLoading(false);
      setMessage("Razorpay is still loading. Please try again in a moment.");
      return;
    }

    const response = await fetch("/api/catalog-checkout/intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerAddress,
        customerEmail,
        customerName,
        customerPhone,
        items: cartProducts.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          slug: item.product.slug,
        })),
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | (RazorpayIntentResponse & { error?: string })
      | null;

    if (!response.ok || !result?.checkoutId || !result.razorpayOrderId) {
      setLoading(false);
      setMessage(result?.error ?? "Checkout could not be started right now.");
      return;
    }

    const razorpay = new window.Razorpay({
      amount: result.amountPaise,
      currency: result.currency,
      description: `Guest checkout for ${cartProducts.length} item${cartProducts.length === 1 ? "" : "s"}`,
      handler: async (paymentResponse: Record<string, unknown>) => {
        const verificationResponse = await fetch("/api/catalog-checkout/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkoutId: result.checkoutId,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          }),
        });

        const verificationResult = (await verificationResponse.json().catch(() => null)) as
          | ({ error?: string } & RazorpayVerifyResponse)
          | null;

        setLoading(false);

        if (!verificationResponse.ok || !verificationResult?.success) {
          setMessage(verificationResult?.error ?? "Payment was received, but verification failed.");
          return;
        }

        clearCart();
        setSuccessOrderId(verificationResult.orderId ?? result.supabaseOrderId);
        setMessage(
          `Payment successful. Your order #${verificationResult.orderId ?? result.supabaseOrderId} has been saved.`,
        );
      },
      key: result.keyId,
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
      name: "Khazana Scoop",
      notes: {
        customer_address: customerAddress,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        website_order_id: String(result.supabaseOrderId),
      },
      order_id: result.razorpayOrderId,
      prefill: {
        contact: customerPhone,
        email: customerEmail,
        name: customerName,
      },
      theme: {
        color: "#0fb7b2",
      },
    });

    razorpay.open();
  }

  return (
    <>
      {mode === "checkout" ? (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          onLoad={() => setRazorpayReady(true)}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">
                {mode === "checkout" ? "Guest checkout" : "Shopping cart"}
              </p>
              <h2
                className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#32524b]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mode === "checkout" ? "Review and pay" : "Your cart"}
              </h2>
            </div>
            <span className="rounded-full bg-[#f2fbfa] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#18a59e]">
              {cartProducts.length} item{cartProducts.length === 1 ? "" : "s"}
            </span>
          </div>

          {cartProducts.length > 0 ? (
            <div className="mt-6 space-y-4">
              {cartProducts.map((item) => (
                <article
                  className="grid gap-4 rounded-[28px] border border-[#ece3d9] bg-[#fffdfa] p-5 shadow-[0_14px_34px_rgba(118,140,134,0.10)] sm:grid-cols-[92px_1fr_auto]"
                  key={item.product.id}
                >
                  <div className="relative h-[92px] w-[92px] overflow-hidden rounded-[22px] bg-[#ffe7f0]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="92px"
                    />
                  </div>

                  <div className="min-w-0 self-center">
                    <Link href={item.product.route} className="block text-xl font-black tracking-[-0.04em] text-[#35534d] sm:text-2xl">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-[#6d817b]">{item.product.eyebrow}</p>
                    <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-[#18a59e]">
                      {item.product.priceLabel}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 self-center sm:items-end">
                    <div className="grid h-12 w-32 grid-cols-3 items-center rounded-full border border-[#dbe9e6] bg-white text-sm font-black text-[#244c4e]">
                      <button
                        aria-label={`Decrease ${item.product.name}`}
                        onClick={() =>
                          setQuantity(
                            item.product.id,
                            item.product.slug,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        type="button"
                      >
                        <Minus size={16} className="mx-auto" />
                      </button>
                      <span className="grid place-items-center">{item.quantity}</span>
                      <button
                        aria-label={`Increase ${item.product.name}`}
                        onClick={() =>
                          setQuantity(
                            item.product.id,
                            item.product.slug,
                            Math.min(item.product.stockQuantity, item.quantity + 1),
                          )
                        }
                        type="button"
                      >
                        <Plus size={16} className="mx-auto" />
                      </button>
                    </div>
                    <button
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#e16594]"
                      onClick={() => removeItem(item.product.id)}
                      type="button"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-[#ece3d9] bg-[#fffdfa] px-5 py-8 text-[#6d817b]">
              Your cart is empty. Add a few products from the catalog to continue.
            </div>
          )}
        </section>

        <aside className="rounded-[32px] border border-[#ece3d9] bg-[linear-gradient(135deg,#fff9ef_0%,#f1fbfb_100%)] p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8">
          <h2 className="inline-flex items-center gap-2 text-3xl font-black tracking-[-0.04em] text-[#34524c]">
            <ShoppingBag size={24} />
            {mode === "checkout" ? "Pay as guest" : "Summary"}
          </h2>

          <div className="mt-6 space-y-3 border-b border-[#e6ebe7] pb-4 text-sm text-[#5f756f]">
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <strong>{formatPaise(subtotalPaise)}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Shipping</span>
              <strong>{shippingPaise === 0 ? "Free" : formatPaise(shippingPaise)}</strong>
            </div>
            {subtotalPaise > 0 && shippingPaise > 0 ? (
              <p className="text-xs leading-5 text-[#71827f]">
                Add {formatPaise(50_000 - subtotalPaise)} more for free shipping.
              </p>
            ) : null}
            <div className="flex justify-between gap-4 text-lg font-black text-[#34524c]">
              <span>Total</span>
              <strong>{formatPaise(totalPaise)}</strong>
            </div>
          </div>

          {mode === "cart" ? (
            <>
              <p className="mt-5 text-sm leading-7 text-[#5f756f]">
                Checkout will be completed as a guest through Razorpay, so shoppers can pay without creating an account first.
              </p>
              <Link
                className={`button-primary mt-6 w-full ${cartProducts.length === 0 ? "pointer-events-none opacity-50" : ""}`}
                href="/checkout"
              >
                Continue to checkout
              </Link>
            </>
          ) : (
            <form className="mt-6 grid gap-3" onSubmit={startRazorpayCheckout}>
              <div className="rounded-[22px] bg-white/82 p-4 text-sm font-bold text-[#2d7d76] shadow-[0_14px_34px_rgba(118,140,134,0.10)]">
                <ShieldCheck className="mr-2 inline-block" size={16} />
                No account required. We store your contact details and payment reference with the order.
              </div>

              <input
                className="storefront-input"
                placeholder="Full name"
                required
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
              <input
                className="storefront-input"
                placeholder="Phone number"
                required
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
              <input
                className="storefront-input"
                placeholder="Email address"
                required
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
              <textarea
                className="storefront-input min-h-24 resize-none py-3"
                placeholder="Complete shipping address"
                required
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
              />

              {message ? (
                <p
                  className={`rounded-[20px] p-3 text-sm font-bold ${
                    successOrderId ? "bg-[#eefbf8] text-[#1b867f]" : "bg-[#fff0ee] text-[#d63f3f]"
                  }`}
                >
                  {message}
                </p>
              ) : null}

              {successOrderId ? (
                <div className="rounded-[22px] border border-[#d8ece7] bg-white/86 p-4 text-sm text-[#35534d]">
                  <p className="inline-flex items-center gap-2 font-black text-[#1b867f]">
                    <CheckCircle2 size={18} />
                    Order #{successOrderId} confirmed
                  </p>
                  <p className="mt-2 leading-6 text-[#627771]">
                    Payment was verified and your order has been saved. Keep this order number for tracking and support.
                  </p>
                  <Link className="button-secondary mt-4 w-full" href="/products">
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <button
                  className="button-primary mt-2 w-full"
                  disabled={loading || cartProducts.length === 0}
                  type="submit"
                >
                  {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
                </button>
              )}
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
