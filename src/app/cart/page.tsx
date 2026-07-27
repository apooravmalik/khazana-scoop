import { CatalogCartClient } from "@/components/catalog-cart-client";
import { PageChrome } from "@/components/page-chrome";
import { getStorefrontCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CartPage(): Promise<React.ReactElement> {
  const products = await getStorefrontCatalogProducts();

  return (
    <PageChrome
      currentPath="/products"
      title="Shopping cart"
      subtitle="Review the catalog items you have added before continuing into guest Razorpay checkout."
    >
      <CatalogCartClient mode="cart" products={products} />
    </PageChrome>
  );
}
