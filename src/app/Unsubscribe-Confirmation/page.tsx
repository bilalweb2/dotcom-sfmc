import type { Metadata } from "next";
import { UnsubscribeConfirmationPage } from "@/components/UnsubscribeConfirmationPage";

export const metadata: Metadata = {
  title: "Frontier",
  description:
    "Your unsubscribe request has been received. Please allow up to 72 hours for processing.",
};

/**
 * Email unsubscribe confirmation page — Server Component.
 * URL: /Unsubscribe-Confirmation
 */
export default function UnsubscribeConfirmation() {
  return <UnsubscribeConfirmationPage />;
}
