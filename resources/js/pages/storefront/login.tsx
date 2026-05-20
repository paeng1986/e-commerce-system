import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontLoginProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontLogin({ listings = [] }: StorefrontLoginProps) {
  return <NexVoltStorefront initialPage="login" listings={listings} />;
}
