import type { Metadata } from "next";
import { PendingDisConfirmationPage } from "@/components/PendingDisConfirmationPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "Your Pending Disco-LP order is being processed. Your self-installation kit will arrive within 5-7 business days.",
};

/**
 * PendingDiscoPage order confirmation page — Server Component.
 * URL: /PendingDisco-Confirmation
 */
export default function pendingdeactivationsavedconfirmation() {
  return <PendingDisConfirmationPage />;
}
