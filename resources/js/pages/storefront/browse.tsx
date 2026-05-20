import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontBrowseProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontBrowse({ listings = [] }: StorefrontBrowseProps) {
  return <NexVoltStorefront initialPage="browse" listings={listings} />;
}
