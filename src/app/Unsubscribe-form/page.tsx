import type { Metadata } from "next";
import { UnsubscribePage } from "@/components/UnsubscribePage";

export const metadata: Metadata = {
  title: "We're Sorry to See You Go | Frontier",
  description:
    "Enter your email address to unsubscribe from Frontier communications. Your request will be processed within 72 hours.",
};

/**
 * Email unsubscribe landing page — Server Component.
 * URL: /Unsubscribe-form
 */
export default function UnsubscribeFormPage() {
  return <UnsubscribePage />;
}
