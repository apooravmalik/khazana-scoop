# Mystery Scoop

A Next.js App Router MVP for Mystery Scoop with Prisma, Supabase Postgres, Cashfree Payments, customer order views, and admin fulfillment screens.

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

## Cashfree checkout

The catalog checkout creates a Cashfree Order on the server, opens Cashfree Hosted Checkout in the browser, and confirms the final order status from the server. Add the following secrets locally and in the deployment environment:

```bash
CASHFREE_APP_ID="..."
CASHFREE_SECRET_KEY="..."
CASHFREE_ENVIRONMENT="sandbox"
CASHFREE_API_VERSION="2025-01-01"
```

`CASHFREE_APP_ID` is the App/Project (Client) ID from Cashfree; `CASHFREE_SECRET_KEY` is the API secret. Never expose the secret in browser code or commit it. Use `sandbox` with test credentials and set `production` only with live credentials.

In Cashfree Dashboard, whitelist the deployed website domain, then add `https://YOUR_DOMAIN/api/cashfree/webhook` under **Payment Gateway → Developers → Webhooks**. Subscribe to payment success, failed, and user-dropped events. The endpoint verifies Cashfree's Base64 HMAC signature over the raw body and timestamp, and independently checks the Cashfree order before marking an order paid.

For the Supabase REST checkout-session table, run `supabase/catalog-checkout-cashfree.sql` once in the Supabase SQL editor. Run `pnpm db:deploy` to apply the matching Prisma migration.

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
