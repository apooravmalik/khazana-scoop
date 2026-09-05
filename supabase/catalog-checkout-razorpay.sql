-- Run this once in the Supabase SQL editor after switching the checkout to Razorpay.
-- Existing Cashfree identifiers are retained under the corresponding Razorpay columns.

do $$
begin
  if to_regclass('public.catalog_checkout_sessions') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'catalog_checkout_sessions' and column_name = 'cashfree_order_id'
    ) then
      alter table public.catalog_checkout_sessions rename column cashfree_order_id to razorpay_order_id;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'catalog_checkout_sessions' and column_name = 'cashfree_payment_id'
    ) then
      alter table public.catalog_checkout_sessions rename column cashfree_payment_id to razorpay_payment_id;
    end if;
  end if;
end $$;
