import { NexVoltStorefront } from "@/components/storefront/NexVoltStorefront";
import type { NexVoltStorefrontProps } from "@/components/storefront/NexVoltStorefront";

type StorefrontRegisterProps = Pick<NexVoltStorefrontProps, "listings">;

export default function StorefrontRegister({ listings = [] }: StorefrontRegisterProps) {
  return <NexVoltStorefront initialPage="register" listings={listings} />;
}
