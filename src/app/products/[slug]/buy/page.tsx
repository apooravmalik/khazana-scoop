import { notFound } from "next/navigation";
import { CatalogProductOrderClient } from "@/components/catalog-product-order-client";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";
import { getStorefrontCatalogProductBySlug } from "@/lib/catalog";

type CatalogProductOrderPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CatalogProductOrderPage({
  params,
}: CatalogProductOrderPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const product = await getStorefrontCatalogProductBySlug(slug);

  if (!product || product.id <= 0 || product.effectivePrice === null || product.stockQuantity <= 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fdf8f4] pb-12">
      <StorefrontHeader currentPath="/products" />
      <section>
        <CatalogProductOrderClient product={product} />
      </section>
      <StorefrontFooter />
    </main>
  );
}
