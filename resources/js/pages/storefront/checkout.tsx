import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontCheckoutProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontCheckout({ listings = [] }: StorefrontCheckoutProps) {
  return <NexVoltStorefront initialPage="checkout" listings={listings} />;
}
