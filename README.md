# Mystery Scoop

A Next.js App Router MVP for Mystery Scoop with Prisma, Supabase Postgres, Razorpay, customer order views, and admin fulfillment screens.

## Getting Started

First, install dependencies and run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

Supabase manages the Postgres database. Prisma manages typed models and migrations.

Copy `.env.example` to `.env`, then add your Supabase pooled `DATABASE_URL` and direct `DIRECT_URL`.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

See `docs/supabase.md` for Supabase setup and GitHub secret names.

Supabase Storage buckets are defined in `supabase/storage-buckets.sql` for product images, profile avatars, inventory images, scoop photos, and packing videos.

## Razorpay checkout

The catalog checkout creates a Razorpay Order on the server, opens Razorpay Standard Checkout in the browser, verifies the returned payment signature on the server, and confirms the payment status through Razorpay. Add the following secrets locally and in the deployment environment:

```bash
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."
```

`RAZORPAY_KEY_ID` is safe to return to Razorpay Checkout; `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must remain server-only. Use Test Mode keys to test, then replace them with Live Mode keys before accepting real payments.

In Razorpay Dashboard, add `https://YOUR_DOMAIN/api/razorpay/webhook` under **Account & Settings → Webhooks**, set the same `RAZORPAY_WEBHOOK_SECRET`, and subscribe to `payment.captured`, `payment.failed` and `order.paid`. Enable automatic payment capture in Razorpay Dashboard; orders are marked paid only after Razorpay reports a `captured` payment.

For the Supabase REST checkout-session table, run `supabase/catalog-checkout-razorpay.sql` once in the Supabase SQL editor. Run `pnpm db:deploy` to apply the matching Prisma migration.

## Automation

GitHub Actions are configured in `.github/workflows`:

- `ci.yml` runs Prisma validation, lint, tests, and build on pull requests and pushes to `main`.
- `supabase-migrate.yml` manually deploys Prisma migrations to Supabase using `SUPABASE_DIRECT_DATABASE_URL`.
- `supabase-storage.yml` manually applies Supabase Storage bucket and policy setup.

## Scripts

```bash
pnpm lint
pnpm test
pnpm build
pnpm db:deploy
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
