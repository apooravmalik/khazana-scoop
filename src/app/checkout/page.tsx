import { CatalogCartClient } from "@/components/catalog-cart-client";
import { PageChrome } from "@/components/page-chrome";
import { getStorefrontCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage(): Promise<React.ReactElement> {
  const products = await getStorefrontCatalogProducts();

  return (
    <PageChrome
      currentPath="/products"
      title="Checkout"
      subtitle="Complete guest checkout with your delivery details and pay securely through Razorpay."
    >
      <CatalogCartClient mode="checkout" products={products} />
    </PageChrome>
  );
}
