import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/catalog-checkout";

const originalKeyId = process.env.RAZORPAY_KEY_ID;
const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

afterEach(() => {
  for (const [key, value] of Object.entries({
    RAZORPAY_KEY_ID: originalKeyId,
    RAZORPAY_KEY_SECRET: originalKeySecret,
    RAZORPAY_WEBHOOK_SECRET: originalWebhookSecret,
  })) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("Razorpay signature validation", () => {
  it("accepts only the payment signature generated from the server order id", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "payment-secret";
    const razorpayOrderId = "order_test123";
    const razorpayPaymentId = "pay_test123";
    const razorpaySignature = crypto
      .createHmac("sha256", "payment-secret")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    expect(verifyRazorpayPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })).toBe(true);
    expect(verifyRazorpayPaymentSignature({ razorpayOrderId: "order_tampered", razorpayPaymentId, razorpaySignature })).toBe(false);
  });

  it("accepts only a webhook signature generated from the exact raw payload", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-secret";
    const payload = '{"event":"payment.captured"}';
    const signature = crypto.createHmac("sha256", "webhook-secret").update(payload).digest("hex");

    expect(verifyRazorpayWebhookSignature({ payload, signature })).toBe(true);
    expect(verifyRazorpayWebhookSignature({ payload: `${payload} `, signature })).toBe(false);
  });
});
