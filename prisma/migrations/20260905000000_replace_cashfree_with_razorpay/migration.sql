DO $$
BEGIN
  IF to_regclass('public."CatalogCheckout"') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CatalogCheckout' AND column_name = 'cashfreeOrderId') THEN
      ALTER TABLE "CatalogCheckout" RENAME COLUMN "cashfreeOrderId" TO "razorpayOrderId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CatalogCheckout' AND column_name = 'cashfreePaymentId') THEN
      ALTER TABLE "CatalogCheckout" RENAME COLUMN "cashfreePaymentId" TO "razorpayPaymentId";
    END IF;
    IF to_regclass('public."CatalogCheckout_cashfreeOrderId_key"') IS NOT NULL THEN
      ALTER INDEX "CatalogCheckout_cashfreeOrderId_key" RENAME TO "CatalogCheckout_razorpayOrderId_key";
    END IF;
  END IF;

  IF to_regclass('public.catalog_checkout_sessions') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'catalog_checkout_sessions' AND column_name = 'cashfree_order_id') THEN
      ALTER TABLE public.catalog_checkout_sessions RENAME COLUMN cashfree_order_id TO razorpay_order_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'catalog_checkout_sessions' AND column_name = 'cashfree_payment_id') THEN
      ALTER TABLE public.catalog_checkout_sessions RENAME COLUMN cashfree_payment_id TO razorpay_payment_id;
    END IF;
    IF to_regclass('public.catalog_checkout_sessions_cashfree_order_id_key') IS NOT NULL THEN
      ALTER INDEX public.catalog_checkout_sessions_cashfree_order_id_key
        RENAME TO catalog_checkout_sessions_razorpay_order_id_key;
    END IF;
  END IF;
END $$;
