CREATE TABLE "CatalogCheckout" (
    "id" TEXT NOT NULL,
    "supabaseOrderId" INTEGER,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "cartSnapshot" JSONB NOT NULL,
    "subtotalPaise" INTEGER NOT NULL,
    "shippingPaise" INTEGER NOT NULL DEFAULT 0,
    "totalPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'created',
    "providerPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogCheckout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CatalogCheckout_supabaseOrderId_key" ON "CatalogCheckout"("supabaseOrderId");
CREATE UNIQUE INDEX "CatalogCheckout_razorpayOrderId_key" ON "CatalogCheckout"("razorpayOrderId");
CREATE INDEX "CatalogCheckout_customerEmail_idx" ON "CatalogCheckout"("customerEmail");
CREATE INDEX "CatalogCheckout_paymentStatus_idx" ON "CatalogCheckout"("paymentStatus");
