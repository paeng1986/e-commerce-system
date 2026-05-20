import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontPortalProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontPortal({ listings = [] }: StorefrontPortalProps) {
  return <NexVoltStorefront initialPage="portal" listings={listings} />;
}
