"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalogCart } from "@/hooks/use-catalog-cart";
import { clearCatalogCartStorage } from "@/lib/catalog-cart";
import { calculateCatalogShippingPaise } from "@/lib/catalog-pricing";
import type { StorefrontCatalogProduct } from "@/lib/catalog-types";

type CatalogCartClientProps = {
  mode: "cart" | "checkout";
  products: StorefrontCatalogProduct[];
};

type CashfreeIntentResponse = {
  cashfreeOrderId: string;
  checkoutId: string;
  environment: "production" | "sandbox";
  paymentSessionId: string;
  supabaseOrderId: number;
};

type CashfreeVerifyResponse = {
  orderId?: number | null;
  paymentStatus?: string;
  success?: boolean;
};

type CartDisplayItem = {
  lineTotalPaise: number;
  product: StorefrontCatalogProduct;
  quantity: number;
  unitPricePaise: number;
};

type CashfreeCheckout = {
  checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => void | Promise<unknown>;
};

type CashfreeConstructor = (options: { mode: "production" | "sandbox" }) => CashfreeCheckout;

declare global {
  interface Window {
    Cashfree?: CashfreeConstructor;
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
        unitPricePaise,
      } satisfies CartDisplayItem;
    })
    .filter((item): item is CartDisplayItem => Boolean(item));
}

export function CatalogCartClient({
  mode,
  products,
}: CatalogCartClientProps): React.ReactElement {
  const { items, removeItem, setQuantity } = useCatalogCart();
  const searchParams = useSearchParams();
  const returnedCashfreeOrderId = searchParams.get("cashfree_order_id");
  const verifiedCashfreeOrderId = useRef<string | null>(null);
  const checkoutFormRef = useRef<HTMLFormElement>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddressLine, setCustomerAddressLine] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerLandmark, setCustomerLandmark] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "review" | "confirmed">("details");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyMessage, setPolicyMessage] = useState("");

  const cartProducts = useMemo(() => getProductCartItems(items, products), [items, products]);
  const subtotalPaise = useMemo(
    () => cartProducts.reduce((total, item) => total + item.lineTotalPaise, 0),
    [cartProducts],
  );
  const shippingPaise = calculateCatalogShippingPaise(subtotalPaise);
  const totalPaise = subtotalPaise + shippingPaise;
  const activeCheckoutStep = successOrderId ? "confirmed" : checkoutStep;

  useEffect(() => {
    if (mode !== "checkout" || !returnedCashfreeOrderId || verifiedCashfreeOrderId.current === returnedCashfreeOrderId) {
      return;
    }

    verifiedCashfreeOrderId.current = returnedCashfreeOrderId;

    void Promise.resolve().then(async () => {
      try {
        setLoading(true);
        setMessage("");
        const response = await fetch(
          `/api/catalog-checkout/verify?cashfreeOrderId=${encodeURIComponent(returnedCashfreeOrderId)}`,
        );
        const result = (await response.json().catch(() => null)) as
          | ({ error?: string } & CashfreeVerifyResponse)
          | null;

        if (!response.ok) {
          setMessage(result?.error ?? "We could not verify the Cashfree payment yet.");
          return;
        }

        if (!result?.success) {
          setMessage("Your Cashfree payment is not confirmed yet. You can safely wait a moment and refresh this page.");
          return;
        }

        const orderId = result.orderId;
        clearCatalogCartStorage();
        setSuccessOrderId(orderId ?? null);
        setCheckoutStep("confirmed");
        setMessage(`Payment successful. Your order #${orderId ?? ""} has been confirmed.`);
      } catch {
        setMessage("We could not verify the Cashfree payment yet. Please refresh this page shortly.");
      } finally {
        setLoading(false);
      }
    });
  }, [mode, returnedCashfreeOrderId]);

  function continueToReview(): void {
    if (!checkoutFormRef.current?.reportValidity()) {
      return;
    }

    if (!policyAccepted) {
      setPolicyMessage("Please agree to the policies before continuing to payment.");
      return;
    }

    setPolicyMessage("");
    setCheckoutStep("review");
  }

  async function startCashfreeCheckout(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccessOrderId(null);

    if (!window.Cashfree || !cashfreeReady) {
      setLoading(false);
      setMessage("Cashfree is still loading. Please try again in a moment.");
      return;
    }

    const response = await fetch("/api/catalog-checkout/intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerAddressLine,
        customerCity,
        customerEmail,
        customerLandmark,
        customerName,
        customerPhone,
        customerPincode,
        customerState,
        items: cartProducts.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          slug: item.product.slug,
        })),
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | (CashfreeIntentResponse & { error?: string })
      | null;

    if (!response.ok || !result?.checkoutId || !result.paymentSessionId) {
      setLoading(false);
      setMessage(result?.error ?? "Checkout could not be started right now.");
      return;
    }

    try {
      const cashfree = window.Cashfree({ mode: result.environment });
      await cashfree.checkout({
        paymentSessionId: result.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch {
      setLoading(false);
      setMessage("Cashfree checkout could not open. Please try again.");
    }
  }

  return (
    <>
      {mode === "checkout" ? (
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="afterInteractive"
          onLoad={() => setCashfreeReady(true)}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className={`rounded-[32px] border border-[#ece3d9] bg-white p-5 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 ${mode === "checkout" ? "hidden lg:block lg:order-1" : ""}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`text-sm font-black uppercase tracking-[0.18em] text-[#708680] ${mode === "checkout" ? "hidden sm:block" : ""}`}>
                {mode === "checkout" ? "Guest checkout" : "Shopping cart"}
              </p>
              <h2
                className={`font-black tracking-[-0.05em] text-[#32524b] ${mode === "checkout" ? "text-2xl sm:mt-3 sm:text-4xl" : "mt-3 text-4xl"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mode === "checkout" ? "Your order" : "Your cart"}
              </h2>
            </div>
            <span className="rounded-full bg-[#f2fbfa] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#18a59e]">
              {cartProducts.length} item{cartProducts.length === 1 ? "" : "s"}
            </span>
          </div>

          {mode === "checkout" ? (
            <div className="mt-4 flex items-center justify-between rounded-[20px] bg-[#fffdfa] px-4 py-3 text-sm text-[#627771] lg:hidden">
              <span>Item details are in your order summary below.</span>
              <Link className="shrink-0 font-black text-[#6f58a8] underline" href="/cart">Edit cart</Link>
            </div>
          ) : null}

          {cartProducts.length > 0 ? (
            <div className={`mt-6 space-y-4 ${mode === "checkout" ? "hidden lg:block" : ""}`}>
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

        <aside className={`rounded-[32px] border border-[#ece3d9] bg-[linear-gradient(135deg,#fff9ef_0%,#f1fbfb_100%)] p-5 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 ${mode === "checkout" ? "lg:order-2" : ""}`}>
          <h2 className="inline-flex items-center gap-2 text-3xl font-black tracking-[-0.04em] text-[#34524c]">
            <ShoppingBag size={24} />
            {mode === "checkout" ? "Checkout" : "Summary"}
          </h2>

          <div className="mt-6 space-y-3 border-b border-[#e6ebe7] pb-4 text-sm text-[#5f756f]">
            <div className="space-y-3 border-b border-[#e6ebe7] pb-4">
              {cartProducts.map((item) => (
                <div className="flex gap-3" key={`summary-${item.product.id}`}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-[#ffe7f0]">
                    <Image alt={item.product.name} className="object-cover" fill sizes="56px" src={item.product.image} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[#34524c]">{item.product.name}</p>
                    <p className="mt-0.5 text-xs text-[#71827f]">Variant: {item.product.eyebrow}</p>
                    <p className="mt-1 text-xs text-[#71827f]">{item.quantity} × {formatPaise(item.unitPricePaise)}</p>
                  </div>
                  <strong className="shrink-0 text-[#34524c]">{formatPaise(item.lineTotalPaise)}</strong>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <strong>{formatPaise(subtotalPaise)}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Discount</span>
              <strong>₹0.00</strong>
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
                Checkout will be completed as a guest through Cashfree, so shoppers can pay without creating an account first.
              </p>
              <Link
                className={`button-primary mt-6 w-full ${cartProducts.length === 0 ? "pointer-events-none opacity-50" : ""}`}
                href="/checkout"
              >
                Continue to checkout
              </Link>
            </>
          ) : (
            <div className="mt-6">
              <ol aria-label="Checkout progress" className="grid grid-cols-3 gap-2">
                {[
                  ["details", "1", "Details"],
                  ["review", "2", "Payment"],
                  ["confirmed", "3", "Done"],
                ].map(([step, number, label]) => {
                  const stepIsActive = activeCheckoutStep === step;
                  const stepIsDone = (step === "details" && activeCheckoutStep !== "details") || (step === "review" && activeCheckoutStep === "confirmed");

                  return (
                    <li className="flex min-w-0 items-center gap-2" key={step}>
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${stepIsActive || stepIsDone ? "bg-[#18a59e] text-white" : "bg-white text-[#71827f]"}`}>
                        {stepIsDone ? "✓" : number}
                      </span>
                      <span className={`truncate text-xs font-black uppercase tracking-[0.08em] ${stepIsActive ? "text-[#34524c]" : "text-[#71827f]"}`}>{label}</span>
                    </li>
                  );
                })}
              </ol>
              {message && activeCheckoutStep !== "confirmed" ? <p className="mt-4 rounded-[20px] bg-[#fff0ee] p-3 text-sm font-bold text-[#d63f3f]">{message}</p> : null}

              {activeCheckoutStep === "details" ? (
                <form className="mt-5 grid gap-3" onSubmit={(event) => { event.preventDefault(); continueToReview(); }} ref={checkoutFormRef}>
                  <div className="rounded-[22px] bg-white/82 p-4 text-sm font-bold text-[#2d7d76] shadow-[0_14px_34px_rgba(118,140,134,0.10)]">
                    <ShieldCheck className="mr-2 inline-block" size={16} />
                    No account required. Add your delivery details, then review everything before payment.
                  </div>

                  <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">Full name<input className="storefront-input" autoComplete="name" required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">Phone number<input className="storefront-input" autoComplete="tel" inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value.replace(/\D/g, ""))} /></label>
                    <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">Email address<input className="storefront-input" autoComplete="email" required type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} /></label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">PIN code<input className="storefront-input" autoComplete="postal-code" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" placeholder="6-digit PIN code" required type="text" value={customerPincode} onChange={(event) => setCustomerPincode(event.target.value.replace(/\D/g, ""))} /></label>
                    <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">City<input className="storefront-input" autoComplete="address-level2" required type="text" value={customerCity} onChange={(event) => setCustomerCity(event.target.value)} /></label>
                  </div>
                  <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">State<input className="storefront-input" autoComplete="address-level1" required type="text" value={customerState} onChange={(event) => setCustomerState(event.target.value)} /></label>
                  <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">Address line<textarea className="storefront-input min-h-24 resize-none py-3" autoComplete="street-address" placeholder="House / flat number, street and locality" required value={customerAddressLine} onChange={(event) => setCustomerAddressLine(event.target.value)} /></label>
                  <label className="grid gap-1.5 text-sm font-bold text-[#35534d]">Landmark <span className="font-normal text-[#71827f]">(optional)</span><input className="storefront-input" autoComplete="off" placeholder="Nearby landmark" type="text" value={customerLandmark} onChange={(event) => setCustomerLandmark(event.target.value)} /></label>

                  <label className="flex gap-3 rounded-[20px] bg-white/82 p-4 text-xs leading-5 text-[#71827f] shadow-[0_14px_34px_rgba(118,140,134,0.10)]">
                    <input checked={policyAccepted} className="mt-0.5 h-4 w-4 accent-[#18a59e]" onChange={(event) => { setPolicyAccepted(event.target.checked); setPolicyMessage(""); }} type="checkbox" />
                    <span> I agree to the <Link className="font-semibold text-[#6f58a8] underline" href="/terms-of-service">Terms &amp; Conditions</Link>, <Link className="font-semibold text-[#6f58a8] underline" href="/privacy-policy">Privacy Policy</Link> and <Link className="font-semibold text-[#6f58a8] underline" href="/cancellation-return-refund-policy">Refund &amp; Cancellation Policy</Link>.</span>
                  </label>
                  {policyMessage ? <p className="rounded-[20px] bg-[#fff0ee] p-3 text-sm font-bold text-[#d63f3f]">{policyMessage}</p> : null}
                  <button className="button-primary mt-2 w-full" disabled={cartProducts.length === 0} type="submit">Continue to review</button>
                </form>
              ) : null}

              {activeCheckoutStep === "review" ? (
                <form className="mt-5 grid gap-4" onSubmit={startCashfreeCheckout}>
                  <div className="rounded-[22px] bg-white/82 p-4 text-sm text-[#35534d] shadow-[0_14px_34px_rgba(118,140,134,0.10)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">Deliver to</p>
                      <button className="text-xs font-black uppercase tracking-[0.08em] text-[#6f58a8] underline" onClick={() => setCheckoutStep("details")} type="button">Edit details</button>
                    </div>
                    <p className="mt-2 leading-6 text-[#627771]"><strong className="text-[#35534d]">{customerName}</strong><br />{customerAddressLine}{customerLandmark ? `, ${customerLandmark}` : ""}<br />{customerCity}, {customerState} – {customerPincode}<br />+91 {customerPhone}</p>
                  </div>
                  <div className="rounded-[22px] bg-white/82 p-4 text-sm text-[#35534d] shadow-[0_14px_34px_rgba(118,140,134,0.10)]">
                    <p className="inline-flex items-center gap-2 font-black text-[#2d7d76]"><ShieldCheck size={16} /> Secure payment</p>
                    <p className="mt-2 leading-6 text-[#627771]">Cashfree will securely show the available payment methods after you continue.</p>
                  </div>
                  <button className="button-primary w-full" disabled={loading || cartProducts.length === 0} type="submit">{loading ? "Opening Cashfree..." : `Pay ${formatPaise(totalPaise)} securely`}</button>
                  <p className="px-1 text-center text-xs leading-5 text-[#71827f]">Your amount is confirmed by our server before Cashfree Checkout opens.</p>
                </form>
              ) : null}

              {activeCheckoutStep === "confirmed" ? (
                <div className="mt-5 rounded-[22px] border border-[#d8ece7] bg-white/86 p-5 text-sm text-[#35534d]">
                  <p className="inline-flex items-center gap-2 font-black text-[#1b867f]"><CheckCircle2 size={20} /> Payment successful</p>
                  <p className="mt-3 text-lg font-black text-[#35534d]">Order #{successOrderId} confirmed</p>
                  <p className="mt-2 leading-6 text-[#627771]">We will send order and delivery updates to the details you provided.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Link className="button-secondary w-full" href="/tracking">Track order</Link>
                    <Link className="button-primary w-full" href="/products">Continue shopping</Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
