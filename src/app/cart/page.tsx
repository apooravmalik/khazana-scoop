import { CatalogCartClient } from "@/components/catalog-cart-client";
import { PageChrome } from "@/components/page-chrome";
import { getStorefrontCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CartPage(): Promise<React.ReactElement> {
  const products = await getStorefrontCatalogProducts();

  return (
    <PageChrome
      compactMobileHero
      currentPath="/products"
      hideDefaultHeroAsideOnMobile
      title="Shopping cart"
      subtitle="Review your items, then continue to secure Cashfree checkout."
    >
      <CatalogCartClient mode="cart" products={products} />
    </PageChrome>
  );
}
