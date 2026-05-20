import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

interface StorefrontProductProps extends Pick<NexVoltStorefrontProps, "listings"> {
  productId?: number | string;
}

export default function StorefrontProduct({ productId, listings = [] }: StorefrontProductProps) {
  return <NexVoltStorefront initialPage="product" productId={productId} listings={listings} />;
}
