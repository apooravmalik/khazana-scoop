import { notFound } from "next/navigation";
import { CatalogProductOrderClient } from "@/components/catalog-product-order-client";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-shell";
import { getStorefrontCatalogProductBySlug } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const product = await getStorefrontCatalogProductBySlug(slug);

  if (!product || product.id <= 0 || product.effectivePrice === null || product.stockQuantity <= 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FBF8F3]">
      <StorefrontHeader currentPath="/products" />
      <CatalogProductOrderClient product={product} />
      <StorefrontFooter />
    </main>
  );
}
