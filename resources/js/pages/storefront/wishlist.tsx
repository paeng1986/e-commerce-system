import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontWishlistProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontWishlist({ listings = [] }: StorefrontWishlistProps) {
  return <NexVoltStorefront initialPage="wishlist" listings={listings} />;
}
