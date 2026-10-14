import type { Metadata } from "next";
import { WHWFConfirmationPage } from "@/components/WHWFConfirmationPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "Your Whole-Home Wi-Fi order is being processed. Your self-installation kit will arrive within 5-7 business days.",
};

/**
 * Whole-Home Wi-Fi order confirmation page — Server Component.
 * URL: /WHWF-Confirmation
 */
export default function WHWFConfirmation() {
  return <WHWFConfirmationPage />;
}
