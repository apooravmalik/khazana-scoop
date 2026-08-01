# Storefront Reader Hand‑off Guide

This document explains how to configure **khazana‑scoop‑web** (storefront) to act as a **read‑only** client of the Supabase database that is owned by the **Khazana‑Scoop** dashboard.

---

## 1️⃣ Confirm the Database Schema is the Source of Truth

| File | Path | What to verify |
|------|------|----------------|
| `supabase/schema.sql` (dashboard) | `file:///Users/yankitrajor/Desktop/Apoorav/Personal/Khazana-Scoop/supabase/schema.sql` | All required tables (`products`, `categories`, `collections`, `discounts`, `product_images`, `stock`, `orders`, `order_items`) are defined. |
| `src/lib/catalog-types.ts` (storefront) | `file:///Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/lib/catalog-types.ts` | TypeScript interfaces exactly match the column definitions in the schema. |

**Quick sanity‑check** (run from the dashboard repo):
```bash
# Diff the schema against the storefront type definitions
diff <(grep -E 'CREATE TABLE|INSERT|ALTER TABLE' /Users/yankitrajor/Desktop/Apoorav/Personal/Khazana-Scoop/supabase/schema.sql) \
     <(sed -n '/export interface.*Product/,/}/p' /Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/lib/catalog-types.ts)
```
If the diff is empty, the schema is aligned.

---

## 2️⃣ Supabase Read‑Only Access for the Storefront

Supabase enforces **Row‑Level Security (RLS)** + policies. The dashboard already ships a policy block that enables any authenticated user to **SELECT** from every catalog table.

### 2.1 Verify RLS & Policies (Dashboard)
```sql
-- In supabase/schema.sql (lines ~182‑284)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to all" ON public.products
  FOR SELECT USING (true);
-- repeat for categories, collections, discounts, product_images …
```
If you ever need to recreate them, run the above blocks via the Supabase SQL editor.

### 2.2 Create an **anonymous** API key for the storefront
1. Open **Supabase → Settings → API**.
2. Copy the **`anon public`** key – this key is **read‑only** because of the policies above.
3. Add it to the storefront’s environment file:
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_anon_XXXXXXXXXXXXXXXXXXXX
```
> **Never** use the `service_role` key in the storefront; it would bypass RLS.

---

## 3️⃣ Environment Variables (Storefront)
| Variable | Value | Where to set |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `khazana-scoop-web/.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **anon** key from step 2.2 | Same file |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(optional)* | Same as anon key | Same file |

The storefront already reads these via `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)`.

---

## 4️⃣ Remove the Static Product Mock (so the UI only uses live data)
1. **Delete** `src/lib/products.ts` (the file that exports the hard‑coded `featuredProducts` array) or comment out its exports.
2. Update imports in `src/lib/catalog.ts`:
```ts
- import { featuredProducts, getProductBySlug } from "@/lib/products";
+ import { getProductBySlug, getCatalogProducts } from "@/lib/catalog";
```
3. Adjust the home‑page component (`src/components/marketing-home.tsx`):
```tsx
- const heroProduct = homeData.featuredProducts[0] ?? homeData.products[0] ?? null;
- const featuredCards = homeData.featuredProducts.slice(1, 3);
+ const heroProduct = homeData.products[0] ?? null;
+ const featuredCards = homeData.products.slice(1, 3);
```
*If you need a “featured” flag, add a boolean column `is_featured` to `products` and include it in the SELECT query.*

---

## 5️⃣ Expose the Remaining Catalog Helpers (storefront)
Add or verify the following thin wrappers in `src/lib/catalog.ts`:
```ts
/** Fetch all products (read‑only) */
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, categories(*), collections(*), discounts(*), product_images(*)`);
  if (error) throw error;
  return data as CatalogProduct[];
}

/** Fetch a single product by slug */
export async function getStorefrontCatalogProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`*, categories(*), collections(*), discounts(*), product_images(*)`)
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as CatalogProduct;
}

/** Fetch categories for the homepage */
export async function getCatalogCategories() {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw error;
  return data;
}

/** Fetch collections for the homepage */
export async function getCatalogCollections() {
  const { data, error } = await supabase.from("collections").select("*");
  if (error) throw error;
  return data;
}
```
Make sure these functions are **exported** and used wherever you need live data.

---

## 6️⃣ Testing the Read‑Only Flow
1. **Run the storefront locally**
```bash
cd /Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web
npm install
npm run dev   # → http://localhost:3000
```
2. Open the home page – you should now see products coming from Supabase (no static fallback).
3. **Add a new product from the dashboard** (`Khazana‑Scoop` → Products → New Product) and fill in required fields.
4. Refresh the storefront page – the newly created product should appear automatically.
5. (Optional) Run a quick console snippet to verify the read‑only client:
```ts
import { supabase } from "@/lib/supabase";
(async () => {
  const { data, error } = await supabase.from("products").select("*");
  console.log(data, error);
})();
```
If the new row shows up, the read‑only connection is correctly configured.

---

## 7️⃣ Future‑Proofing
| Future task | Why it matters | Quick tip |
|------------|----------------|-----------|
| **Add new columns** (e.g., `rating`) | Must stay in sync across both codebases | Add column to `schema.sql`, run `ALTER TABLE` in Supabase, then update `catalog-types.ts`. |
| **Shared Type Package** | Avoid duplicated TS interfaces | Create a small npm workspace (`packages/catalog-types`) and import from both repos. |
| **CI checks** | Prevent drift | Add a script that runs `pg_dump --schema-only` → compare to `schema.sql`. |
| **Read‑only API key rotation** | Security hygiene | Rotate the anon key periodically; update `.env.local` in the storefront. |

---

## 📄 Quick Reference Links (click to open)
- **Dashboard schema**: [schema.sql](file:///Users/yankitrajor/Desktop/Apoorav/Personal/Khazana-Scoop/supabase/schema.sql)
- **Storefront catalog client**: [src/lib/catalog.ts](file:///Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/lib/catalog.ts)
- **Storefront catalog types**: [src/lib/catalog-types.ts](file:///Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/lib/catalog-types.ts)
- **Home component (still static)**: [src/components/marketing-home.tsx](file:///Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/components/marketing-home.tsx)
- **Product detail page**: [src/app/products/[slug]/page.tsx](file:///Users/yankitrajor/Desktop/Apoorav/Personal/khazana-scoop-web/src/app/products/%5Bslug%5D/page.tsx)

---

### ✅ Done
A Markdown hand‑off guide has been added as an artifact. You can copy its contents into `khazana-scoop-web/docs/hand-off-to-storefront.md` in the repository.
