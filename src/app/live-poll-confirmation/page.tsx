import type { Metadata } from "next";
import { LivePollConfirmationPage } from "@/components/LivePollConfirmationPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "Your Whole-Home Wi-Fi order is being processed. Your self-installation kit will arrive within 5-7 business days.",
};

/**
 * Whole-Home Wi-Fi order confirmation page — Server Component.
 * URL: /LivePoll-Confirmation
 */
export default function LivePollConfirmation() {
  return <LivePollConfirmationPage />;
}
