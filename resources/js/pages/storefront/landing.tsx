import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontLandingProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontLanding({ listings = [] }: StorefrontLandingProps) {
  return <NexVoltStorefront initialPage="landing" listings={listings} />;
}
