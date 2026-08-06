#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://localhost:3021";
const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");

/**
 * @typedef {{
 *   name: string;
 *   method: string;
 *   path: string;
 *   headers?: Record<string, string>;
 *   body?: unknown;
 *   expectedStatuses: number[];
 *   healthMode: "healthy" | "protected";
 *   note: string;
 * }} SmokeCheck
 */

/** @type {SmokeCheck[]} */
const checks = [
  {
    name: "Admin tiers catalog",
    method: "GET",
    path: "/api/admin/tiers",
    expectedStatuses: [200],
    healthMode: "healthy",
    note: "Public catalog seed/data route should load.",
  },
  {
    name: "Admin inventory list",
    method: "GET",
    path: "/api/admin/inventory",
    expectedStatuses: [200],
    healthMode: "healthy",
    note: "Inventory read should succeed if database access is healthy.",
  },
  {
    name: "Admin inventory patch validation",
    method: "PATCH",
    path: "/api/admin/inventory",
    body: {},
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Validation probe avoids mutating inventory.",
  },
  {
    name: "Admin order patch missing order",
    method: "PATCH",
    path: "/api/admin/orders/smoke-missing-order",
    body: { status: "Pending" },
    expectedStatuses: [404],
    healthMode: "healthy",
    note: "Exercises order status update path without changing a real order.",
  },
  {
    name: "Auth login validation",
    method: "POST",
    path: "/api/auth/login",
    body: {},
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Validation probe only.",
  },
  {
    name: "Auth logout",
    method: "POST",
    path: "/api/auth/logout",
    expectedStatuses: [200],
    healthMode: "healthy",
    note: "Should always clear cookie safely.",
  },
  {
    name: "Auth profile protection",
    method: "GET",
    path: "/api/auth/profile",
    expectedStatuses: [401],
    healthMode: "protected",
    note: "Expected unauthenticated rejection proves route protection is active.",
  },
  {
    name: "Auth register validation",
    method: "POST",
    path: "/api/auth/register",
    body: {},
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Validation probe only.",
  },
  {
    name: "Cart calculation",
    method: "POST",
    path: "/api/cart",
    body: { tierId: "small", addOnIds: [] },
    expectedStatuses: [200],
    healthMode: "healthy",
    note: "Uses seeded tier id and exercises database-backed cart math.",
  },
  {
    name: "Catalog checkout intent validation",
    method: "POST",
    path: "/api/catalog-checkout/intent",
    body: {},
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Validation probe avoids creating Razorpay or Supabase checkout records.",
  },
  {
    name: "Catalog checkout verify missing session",
    method: "POST",
    path: "/api/catalog-checkout/verify",
    body: {
      checkoutId: "smoke-missing-checkout",
      razorpay_order_id: "order_smoke_missing",
      razorpay_payment_id: "pay_smoke_missing",
      razorpay_signature: "sig_smoke_missing",
    },
    expectedStatuses: [404],
    healthMode: "healthy",
    note: "Exercises Prisma checkout lookup without marking a payment.",
  },
  {
    name: "Catalog direct order unavailable product",
    method: "POST",
    path: "/api/catalog-orders",
    body: {
      customerAddress: "123 Testing Street, New Delhi",
      customerName: "Smoke Test",
      customerPhone: "9999999999",
      productId: 999999,
      quantity: 1,
      slug: "smoke-missing-product",
    },
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Valid shape, impossible product. Safe way to exercise catalog lookup.",
  },
  {
    name: "Checkout session protection",
    method: "POST",
    path: "/api/checkout",
    body: { tierId: "small", addOnIds: [] },
    expectedStatuses: [200, 401],
    healthMode: "protected",
    note: "401 is expected when not logged in; 200 means authenticated checkout is configured.",
  },
  {
    name: "Orders list protection",
    method: "GET",
    path: "/api/orders",
    expectedStatuses: [401],
    healthMode: "protected",
    note: "Expected unauthenticated rejection.",
  },
  {
    name: "Orders create protection",
    method: "POST",
    path: "/api/orders",
    body: { tierId: "small", addOnIds: [] },
    expectedStatuses: [401],
    healthMode: "protected",
    note: "Expected unauthenticated rejection.",
  },
  {
    name: "Accept scoop missing order",
    method: "POST",
    path: "/api/orders/smoke-missing-order/accept",
    expectedStatuses: [404],
    healthMode: "healthy",
    note: "Safe missing-record probe.",
  },
  {
    name: "Re-scoop missing order",
    method: "POST",
    path: "/api/orders/smoke-missing-order/rescoop",
    expectedStatuses: [404],
    healthMode: "healthy",
    note: "Safe missing-record probe.",
  },
  {
    name: "Packing video missing order",
    method: "POST",
    path: "/api/orders/smoke-missing-order/video",
    body: {
      packingVideoUrl: "https://example.com/video.mp4",
      scoopPhotoUrl: "https://example.com/photo.jpg",
    },
    expectedStatuses: [404],
    healthMode: "healthy",
    note: "Valid payload, missing target order.",
  },
  {
    name: "Stripe webhook baseline",
    method: "POST",
    path: "/api/stripe/webhook",
    body: {},
    expectedStatuses: [400],
    healthMode: "healthy",
    note: "Healthy when Stripe is configured and missing signature is rejected cleanly.",
  },
];

function summarizeBody(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 200);
}

async function runCheck(check) {
  const url = `${baseUrl}${check.path}`;
  const init = {
    method: check.method,
    headers: {
      Accept: "application/json",
      ...(check.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(check.headers ?? {}),
    },
    body: check.body === undefined ? undefined : JSON.stringify(check.body),
    redirect: "manual",
  };

  const startedAt = Date.now();

  try {
    const response = await fetch(url, init);
    const elapsedMs = Date.now() - startedAt;
    const text = await response.text();
    const matchedExpectation = check.expectedStatuses.includes(response.status);
    const verdict = matchedExpectation
      ? check.healthMode === "protected"
        ? "protected-ok"
        : "healthy"
      : "unhealthy";

    return {
      name: check.name,
      method: check.method,
      path: check.path,
      url,
      expectedStatuses: check.expectedStatuses,
      status: response.status,
      ok: response.ok,
      verdict,
      elapsedMs,
      note: check.note,
      responseSnippet: summarizeBody(text),
    };
  } catch (error) {
    return {
      name: check.name,
      method: check.method,
      path: check.path,
      url,
      expectedStatuses: check.expectedStatuses,
      status: null,
      ok: false,
      verdict: "unhealthy",
      elapsedMs: Date.now() - startedAt,
      note: check.note,
      responseSnippet: error instanceof Error ? error.message : String(error),
    };
  }
}

const results = [];
for (const check of checks) {
  results.push(await runCheck(check));
}

const summary = {
  baseUrl,
  runAt: new Date().toISOString(),
  totals: {
    checks: results.length,
    healthy: results.filter((result) => result.verdict === "healthy").length,
    protectedOk: results.filter((result) => result.verdict === "protected-ok").length,
    unhealthy: results.filter((result) => result.verdict === "unhealthy").length,
  },
  results,
};

console.log(JSON.stringify(summary, null, 2));
