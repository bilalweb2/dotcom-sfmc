import type { Metadata } from "next";
import { WHWFConfirmationPage } from "@/components/WHWFConfirmationPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "Your Unbreakable Wi-Fi order is being processed. You will receive a service order confirmation email with changes to your bill.",
};

/**
 * Unbreakable Wi-Fi order confirmation page — Server Component.
 * URL: /UBB-confirmation-Copy
 */
export default function UBBConfirmationCopyPage() {
  return (
    <WHWFConfirmationPage message="Now you can enjoy peace of mind with a backup connection during network outages." orderNow={true} UBB={true}/>
  );
}
