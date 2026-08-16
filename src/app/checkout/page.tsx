import { CatalogCartClient } from "@/components/catalog-cart-client";
import { PageChrome } from "@/components/page-chrome";
import { getStorefrontCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage(): Promise<React.ReactElement> {
  const products = await getStorefrontCatalogProducts();

  return (
    <PageChrome
      compactMobileHero
      currentPath="/products"
      hideDefaultHeroAsideOnMobile
      title="Checkout"
      subtitle="Add your delivery details, review your order, and pay securely with Cashfree."
    >
      <CatalogCartClient mode="checkout" products={products} />
    </PageChrome>
  );
}
