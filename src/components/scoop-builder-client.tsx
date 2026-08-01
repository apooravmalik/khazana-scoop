"use client";

import { Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type BuilderMode = "mystery" | "build";

type BuilderVariant = "combined" | BuilderMode;

type MysterySizeOption = {
  id: string;
  label: string;
  price: number;
  productCount: string;
};

type BuildSizeOption = {
  id: string;
  label: string;
  price: number;
  basicLimit: number;
  premiumLimit: number;
  summary: string;
};

type ScoopBuilderClientProps = {
  variant: BuilderVariant;
};

const mysterySizes: MysterySizeOption[] = [
  { id: "small-mystery", label: "Small Scoop", price: 599, productCount: "6-7 surprise products" },
  { id: "medium-mystery", label: "Medium Scoop", price: 899, productCount: "12-13 surprise products" },
  { id: "large-mystery", label: "Large Scoop", price: 1399, productCount: "17-18 surprise products" },
];

const buildSizes: BuildSizeOption[] = [
  {
    id: "small-build",
    label: "Small Scoop",
    price: 799,
    basicLimit: 7,
    premiumLimit: 2,
    summary: "Choose 7 basic + 2 premium items",
  },
  {
    id: "medium-build",
    label: "Medium Scoop",
    price: 1299,
    basicLimit: 13,
    premiumLimit: 3,
    summary: "Choose 13 basic + 3 premium items",
  },
  {
    id: "large-build",
    label: "Large Scoop",
    price: 1799,
    basicLimit: 16,
    premiumLimit: 4,
    summary: "Choose 16 basic + 4 premium items",
  },
];

const basicItems = [
  "Cute Pen",
  "Washi Tape",
  "Paper Soap",
  "Hair Accessory",
  "Sticker Sheet",
  "Mini Notebook",
  "Phone Charm",
  "Lip Balm",
];

const premiumItems = [
  "Premium Journal",
  "Premium Bracelet",
  "Soft Toy",
  "Mini Perfume",
  "Statement Keychain",
  "Korean Hair Claw",
];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createCountRecord(items: string[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item, 0]));
}

export function ScoopBuilderClient({
  variant,
}: ScoopBuilderClientProps): React.ReactElement {
  const fixedMode = variant === "combined" ? null : variant;
  const [mode, setMode] = useState<BuilderMode>(fixedMode ?? "mystery");
  const [selectedMysterySizeId, setSelectedMysterySizeId] = useState<string>(mysterySizes[0].id);
  const [selectedBuildSizeId, setSelectedBuildSizeId] = useState<string>(buildSizes[0].id);
  const [mysteryPreferences, setMysteryPreferences] = useState("");
  const [mysteryGiftNote, setMysteryGiftNote] = useState("");
  const [buildGiftNote, setBuildGiftNote] = useState("");
  const [mysteryVideo, setMysteryVideo] = useState(false);
  const [buildVideo, setBuildVideo] = useState(false);
  const [basicCounts, setBasicCounts] = useState<Record<string, number>>(createCountRecord(basicItems));
  const [premiumCounts, setPremiumCounts] = useState<Record<string, number>>(createCountRecord(premiumItems));
  const [message, setMessage] = useState("");

  const activeMode = fixedMode ?? mode;
  const selectedMysterySize =
    mysterySizes.find((size) => size.id === selectedMysterySizeId) ?? mysterySizes[0];
  const selectedBuildSize =
    buildSizes.find((size) => size.id === selectedBuildSizeId) ?? buildSizes[0];

  const basicTotal = useMemo(
    () => Object.values(basicCounts).reduce((total, count) => total + count, 0),
    [basicCounts],
  );
  const premiumTotal = useMemo(
    () => Object.values(premiumCounts).reduce((total, count) => total + count, 0),
    [premiumCounts],
  );

  const buildSelectionComplete =
    basicTotal === selectedBuildSize.basicLimit && premiumTotal === selectedBuildSize.premiumLimit;
  const mysteryTotal = selectedMysterySize.price + (mysteryVideo ? 50 : 0);
  const buildTotal = selectedBuildSize.price + (buildVideo ? 50 : 0);

  function switchMode(nextMode: BuilderMode): void {
    if (fixedMode) {
      return;
    }

    setMode(nextMode);
    setMessage("");
  }

  function selectBuildSize(nextSizeId: string): void {
    setSelectedBuildSizeId(nextSizeId);
    setMessage("");
    setBasicCounts(createCountRecord(basicItems));
    setPremiumCounts(createCountRecord(premiumItems));
  }

  function updateCount(kind: "basic" | "premium", item: string, direction: -1 | 1): void {
    const limits =
      kind === "basic"
        ? { total: basicTotal, max: selectedBuildSize.basicLimit, counts: basicCounts, setter: setBasicCounts }
        : {
            total: premiumTotal,
            max: selectedBuildSize.premiumLimit,
            counts: premiumCounts,
            setter: setPremiumCounts,
          };

    limits.setter((current) => {
      const currentValue = current[item] ?? 0;
      const nextValue = Math.max(0, Math.min(3, currentValue + direction));

      if (direction > 0 && limits.total >= limits.max && nextValue > currentValue) {
        return current;
      }

      return { ...current, [item]: nextValue };
    });

    setMessage("");
  }

  function persistDraft(): void {
    const payload =
      activeMode === "mystery"
        ? {
            giftNote: mysteryGiftNote,
            mode: "mystery",
            preferences: mysteryPreferences,
            size: selectedMysterySize.label,
            total: mysteryTotal,
            video: mysteryVideo,
          }
        : {
            basicCounts,
            giftNote: buildGiftNote,
            mode: "build",
            premiumCounts,
            size: selectedBuildSize.label,
            total: buildTotal,
            video: buildVideo,
          };

    window.localStorage.setItem("khazana-scoop-builder-draft", JSON.stringify(payload));
    setMessage("Your scoop selection has been saved in this browser.");
  }

  const summaryCard = (
    <aside className="h-fit rounded-[26px] border border-[#eadfd8] bg-white p-6 shadow-[0_14px_36px_rgba(39,78,72,0.09)] lg:sticky lg:top-24">
      <h3 className="text-[21px] font-black tracking-[-0.03em] text-[#173f3b]">
        {variant === "combined" ? "Order summary" : "Your order"}
      </h3>

      {activeMode === "mystery" ? (
        <>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Selected size</span>
            <strong className="text-right text-[#173f3b]">{selectedMysterySize.label}</strong>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Preferences</span>
            <strong className="text-right text-[#173f3b]">
              {mysteryPreferences.trim() ? "Added" : "Not added"}
            </strong>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Personalised video</span>
            <strong className="text-right text-[#173f3b]">
              {mysteryVideo ? "Added (+₹50)" : "Not added"}
            </strong>
          </div>
          <div className="flex items-end justify-between gap-4 py-5">
            <span className="text-sm font-semibold text-[#173f3b]">Total</span>
            <strong className="text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">
              {formatMoney(mysteryTotal)}
            </strong>
          </div>
          <button
            className="min-h-[50px] w-full rounded-full bg-[#18b8b2] px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#119f9a]"
            onClick={persistDraft}
            type="button"
          >
            Add scoop to cart
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Selected size</span>
            <strong className="text-right text-[#173f3b]">{selectedBuildSize.label}</strong>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Selected items</span>
            <strong className="text-right text-[#173f3b]">
              {basicTotal}/{selectedBuildSize.basicLimit} basic, {premiumTotal}/{selectedBuildSize.premiumLimit} premium
            </strong>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eadfd8] py-3 text-[13px] text-[#71827f]">
            <span>Personalised video</span>
            <strong className="text-right text-[#173f3b]">
              {buildVideo ? "Added (+₹50)" : "Not added"}
            </strong>
          </div>
          <div className="flex items-end justify-between gap-4 py-5">
            <span className="text-sm font-semibold text-[#173f3b]">Total</span>
            <strong className="text-[28px] font-black tracking-[-0.03em] text-[#173f3b]">
              {formatMoney(buildTotal)}
            </strong>
          </div>
          <button
            className="min-h-[50px] w-full rounded-full bg-[#18b8b2] px-6 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#119f9a] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!buildSelectionComplete}
            onClick={persistDraft}
            type="button"
          >
            {buildSelectionComplete ? "Add scoop to cart" : "Complete your selection"}
          </button>
        </>
      )}

      <p className="mt-3 text-center text-[11px] leading-5 text-[#71827f]">
        Free shipping across India. Dispatch in 1-2 days; delivery in approximately 5-6 days.
      </p>

      {message ? (
        <div className="mt-4 rounded-[16px] bg-[#eaf9f7] px-4 py-3 text-sm font-semibold text-[#245c57]">
          {message}
        </div>
      ) : null}
    </aside>
  );

  return (
    <div className={variant === "combined" ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"}>
      <div className="rounded-[26px] border border-[#eadfd8] bg-white p-6 shadow-[0_14px_36px_rgba(39,78,72,0.09)] sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[27px] font-black tracking-[-0.03em] text-[#173f3b]">
              {variant === "combined"
                ? "Create your order"
                : activeMode === "mystery"
                  ? "Create your Mystery Scoop"
                  : "Build your scoop"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#71827f]">
              {variant === "combined"
                ? "Switch between a surprise scoop and a fully custom build."
                : activeMode === "mystery"
                  ? "Complete these simple steps and review your total on the right."
                  : "Choose a size, complete both product limits, and review your total on the right."}
            </p>
          </div>
        </div>

        {variant === "combined" ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Choose order type">
            <button
              aria-selected={activeMode === "mystery"}
              className={`rounded-[20px] border p-5 text-left transition ${
                activeMode === "mystery"
                  ? "border-[#18b8b2] bg-[#eaf9f7]"
                  : "border-[#eadfd8] bg-[#fffaf7]"
              }`}
              onClick={() => switchMode("mystery")}
              type="button"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#18b8b2] shadow-sm">
                {activeMode === "mystery" ? <Check size={15} /> : <Sparkles size={15} />}
              </span>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.08em] text-[#245c57]">Surprise me</p>
              <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#173f3b]">Mystery Scoop</h3>
              <p className="mt-2 text-sm leading-6 text-[#71827f]">
                Share preferences and let the team build a surprise mix.
              </p>
            </button>
            <button
              aria-selected={activeMode === "build"}
              className={`rounded-[20px] border p-5 text-left transition ${
                activeMode === "build"
                  ? "border-[#18b8b2] bg-[#eaf9f7]"
                  : "border-[#eadfd8] bg-[#fffaf7]"
              }`}
              onClick={() => switchMode("build")}
              type="button"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#18b8b2] shadow-sm">
                {activeMode === "build" ? <Check size={15} /> : <Sparkles size={15} />}
              </span>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.08em] text-[#245c57]">Choose everything</p>
              <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#173f3b]">Build Your Own Box</h3>
              <p className="mt-2 text-sm leading-6 text-[#71827f]">
                Select the exact basic and premium items you want in the box.
              </p>
            </button>
          </div>
        ) : null}

        {activeMode === "mystery" ? (
          <div className="mt-6 space-y-6">
            <section className="border-t border-[#eadfd8] pt-6 first:border-t-0 first:pt-0">
              <div className="mb-4">
                <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">1. Choose a size</h3>
                <p className="mt-1 text-xs text-[#71827f]">Every size includes free surprise extras.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {mysterySizes.map((size) => {
                  const selected = size.id === selectedMysterySizeId;

                  return (
                    <button
                      className={`rounded-[15px] border-2 px-4 py-5 text-left transition ${
                        selected ? "border-[#18b8b2] bg-[#eaf9f7]" : "border-[#eadfd8] bg-white"
                      }`}
                      key={size.id}
                      onClick={() => setSelectedMysterySizeId(size.id)}
                      type="button"
                    >
                      <strong className="block text-base font-black text-[#173f3b]">{size.label}</strong>
                      <small className="mt-2 block min-h-[34px] text-sm leading-5 text-[#71827f]">
                        {size.productCount}
                      </small>
                      <b className="mt-4 block text-[19px] font-black text-[#173f3b]">
                        {formatMoney(size.price)}
                      </b>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-[#eadfd8] pt-6">
              <div className="mb-4">
                <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">
                  2. Share any 3 preferences
                </h3>
                <p className="mt-1 text-xs text-[#71827f]">
                  Preferences are requests, not guaranteed products.
                </p>
              </div>
              <label className="mb-2 block text-sm font-black text-[#173f3b]" htmlFor="mysteryPreferences">
                Your preferences
              </label>
              <textarea
                className="min-h-[104px] w-full rounded-[13px] border border-[#eadfd8] px-4 py-3 outline-none transition focus:border-[#18b8b2] focus:ring-4 focus:ring-[#18b8b2]/10"
                id="mysteryPreferences"
                onChange={(event) => setMysteryPreferences(event.target.value)}
                placeholder="Example: only stationery, no stationery, mostly pink and black"
                value={mysteryPreferences}
              />
              <span className="mt-2 block text-[11px] leading-5 text-[#71827f]">
                You may write up to three preferences, such as: only stationery, no stationery, or mostly pink and black.
              </span>
            </section>

            {variant === "combined" ? (
              <section className="border-t border-[#eadfd8] pt-6">
                <div className="mb-4">
                  <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">
                    3. Gift note or packing instruction
                  </h3>
                </div>
                <textarea
                  className="min-h-[104px] w-full rounded-[13px] border border-[#eadfd8] px-4 py-3 outline-none transition focus:border-[#18b8b2] focus:ring-4 focus:ring-[#18b8b2]/10"
                  onChange={(event) => setMysteryGiftNote(event.target.value)}
                  placeholder="Add a short message or packing instruction"
                  value={mysteryGiftNote}
                />
              </section>
            ) : null}

            <section className="border-t border-[#eadfd8] pt-6">
              <div className="flex items-start gap-3 rounded-[14px] border border-[#eadfd8] bg-[#fff7f9] px-4 py-4">
                <input
                  checked={mysteryVideo}
                  className="mt-1 h-[18px] w-[18px] accent-[#18b8b2]"
                  id="mysteryVideo"
                  onChange={(event) => setMysteryVideo(event.target.checked)}
                  type="checkbox"
                />
                <label className="cursor-pointer text-sm font-semibold text-[#173f3b]" htmlFor="mysteryVideo">
                  Add personalised video for ₹50 extra
                </label>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <section className="border-t border-[#eadfd8] pt-6 first:border-t-0 first:pt-0">
              <div className="mb-4">
                <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">1. Choose a size</h3>
                <p className="mt-1 text-xs text-[#71827f]">
                  {variant === "combined"
                    ? "Changing the size resets the selected products."
                    : "Changing the size resets the selected products."}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {buildSizes.map((size) => {
                  const selected = size.id === selectedBuildSizeId;

                  return (
                    <button
                      className={`rounded-[15px] border-2 px-4 py-5 text-left transition ${
                        selected ? "border-[#18b8b2] bg-[#eaf9f7]" : "border-[#eadfd8] bg-white"
                      }`}
                      key={size.id}
                      onClick={() => selectBuildSize(size.id)}
                      type="button"
                    >
                      <strong className="block text-base font-black text-[#173f3b]">{size.label}</strong>
                      <small className="mt-2 block min-h-[34px] text-sm leading-5 text-[#71827f]">
                        {size.summary}
                      </small>
                      <b className="mt-4 block text-[19px] font-black text-[#173f3b]">
                        {formatMoney(size.price)}
                      </b>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-[#eadfd8] pt-6">
              <div className="mb-4">
                <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">2. Pick your products</h3>
                <p className="mt-1 text-xs text-[#71827f]">
                  The cart button unlocks after both limits are complete.
                </p>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[13px] bg-[#fff5f8] px-4 py-3 text-sm font-black text-[#173f3b]">
                  Basic items{" "}
                  <strong className="float-right">
                    {basicTotal}/{selectedBuildSize.basicLimit}
                  </strong>
                </div>
                <div className="rounded-[13px] bg-[#fff5f8] px-4 py-3 text-sm font-black text-[#173f3b]">
                  Premium items{" "}
                  <strong className="float-right">
                    {premiumTotal}/{selectedBuildSize.premiumLimit}
                  </strong>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[16px] border border-[#eadfd8] bg-[#fffdfb] p-4">
                  <h4 className="mb-3 text-sm font-black uppercase tracking-[0.08em] text-[#173f3b]">
                    Basic picks
                  </h4>
                  <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
                    {basicItems.map((item) => (
                      <div
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] border border-[#eadfd8] bg-white p-3"
                        key={item}
                      >
                        <div>
                          <span className="block text-sm font-black text-[#173f3b]">{item}</span>
                          <span className="text-xs text-[#71827f]">Basic item</span>
                        </div>
                        <div className="grid grid-cols-[28px_24px_28px] items-center text-center">
                          <button
                            className="h-7 w-7 rounded-full border border-[#eadfd8] bg-white font-black"
                            onClick={() => updateCount("basic", item, -1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-[#173f3b]">{basicCounts[item] ?? 0}</span>
                          <button
                            className="h-7 w-7 rounded-full border border-[#eadfd8] bg-white font-black"
                            onClick={() => updateCount("basic", item, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#eadfd8] bg-[#fffdfb] p-4">
                  <h4 className="mb-3 text-sm font-black uppercase tracking-[0.08em] text-[#173f3b]">
                    Premium picks
                  </h4>
                  <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
                    {premiumItems.map((item) => (
                      <div
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] border border-[#eadfd8] bg-white p-3"
                        key={item}
                      >
                        <div>
                          <span className="block text-sm font-black text-[#173f3b]">{item}</span>
                          <span className="text-xs text-[#71827f]">Premium item</span>
                        </div>
                        <div className="grid grid-cols-[28px_24px_28px] items-center text-center">
                          <button
                            className="h-7 w-7 rounded-full border border-[#eadfd8] bg-white font-black"
                            onClick={() => updateCount("premium", item, -1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-[#173f3b]">{premiumCounts[item] ?? 0}</span>
                          <button
                            className="h-7 w-7 rounded-full border border-[#eadfd8] bg-white font-black"
                            onClick={() => updateCount("premium", item, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-[#eadfd8] pt-6">
              <div className="mb-4">
                <h3 className="text-[19px] font-black tracking-[-0.03em] text-[#173f3b]">
                  {variant === "combined" ? "3. Add a note" : "3. Personalised note"}
                </h3>
                <p className="mt-1 text-xs text-[#71827f]">Optional.</p>
              </div>
              <textarea
                className="min-h-[104px] w-full rounded-[13px] border border-[#eadfd8] px-4 py-3 outline-none transition focus:border-[#18b8b2] focus:ring-4 focus:ring-[#18b8b2]/10"
                onChange={(event) => setBuildGiftNote(event.target.value)}
                placeholder={
                  variant === "combined"
                    ? "Write your personalised message"
                    : "Write a short personalised message"
                }
                value={buildGiftNote}
              />
            </section>

            <section className="border-t border-[#eadfd8] pt-6">
              <div className="flex items-start gap-3 rounded-[14px] border border-[#eadfd8] bg-[#fff7f9] px-4 py-4">
                <input
                  checked={buildVideo}
                  className="mt-1 h-[18px] w-[18px] accent-[#18b8b2]"
                  id="buildVideo"
                  onChange={(event) => setBuildVideo(event.target.checked)}
                  type="checkbox"
                />
                <label className="cursor-pointer text-sm font-semibold text-[#173f3b]" htmlFor="buildVideo">
                  Add personalised video for ₹50 extra
                </label>
              </div>
            </section>
          </div>
        )}
      </div>

      {summaryCard}
    </div>
  );
}
