"use client";

import Link from "next/link";
import { LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps): React.ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            email: String(formData.get("email") ?? ""),
            name: String(formData.get("name") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };
    const response = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    setLoading(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(result?.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form
        className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#718681]">
            {mode === "signup" ? "Create your scoop account" : "Welcome back"}
          </p>
          <h2
            className="mt-3 text-[2.2rem] font-black tracking-[-0.05em] text-[#32524b] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {mode === "signup" ? "Save every reveal in one place." : "Log in to your Mystery Scoop space."}
          </h2>
        </div>

        <div className="grid gap-4">
          {mode === "signup" ? (
            <Field label="Name" icon={<UserRound size={18} />}>
              <input
                autoComplete="name"
                className="storefront-input"
                minLength={2}
                name="name"
                required
              />
            </Field>
          ) : null}

          <Field label="Email" icon={<Mail size={18} />}>
            <input
              autoComplete="email"
              className="storefront-input"
              name="email"
              required
              type="email"
            />
          </Field>

          <Field label="Password" icon={<LockKeyhole size={18} />}>
            <input
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="storefront-input"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </Field>
        </div>

        {error ? <p className="mt-4 rounded-[20px] bg-[#fff0ee] px-4 py-3 text-sm font-bold text-[#d63f3f]">{error}</p> : null}

        <button className="button-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-[#6d817b]">
          {mode === "signup" ? "Already have an account?" : "New to Mystery Scoop?"}{" "}
          <Link className="font-black text-[#18a59e]" href={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Log in" : "Sign up"}
          </Link>
        </p>
      </form>

      <aside className="rounded-[32px] border border-[#ece3d9] bg-[linear-gradient(135deg,#fff9ef_0%,#f1fbfb_100%)] p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#718681]">Inside your account</p>
        <div className="mt-5 grid gap-4">
          {[
            "Track scoop status from pending to delivered.",
            "Open packing photos or video links when available.",
            "Keep Scoop Points, re-scoop windows, and past orders together.",
          ].map((item) => (
            <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_14px_34px_rgba(118,140,134,0.10)]" key={item}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0fbfa] text-[#18a59e]">
                <Sparkles size={18} />
              </span>
              <p className="mt-4 text-base leading-7 text-[#5f746f]">{item}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Field({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}): React.ReactElement {
  return (
    <label className="block text-sm font-black uppercase tracking-[0.12em] text-[#667c76]">
      <span className="mb-2 inline-flex items-center gap-2">
        <span className="text-[#18a59e]">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
