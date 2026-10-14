import type { Metadata } from "next";
import { UnsubscribePreferencesPage } from "@/components/UnsubscribePreferencesPage";

export const metadata: Metadata = {
  title: "We're Sorry to See You Go | Frontier",
  description:
    "Select the types of emails you would no longer like to receive from Frontier, and we will take care of the rest.",
};

/**
 * Unsubscribe email preferences page — Server Component.
 * URL: /UnsubscribePreferences
 */
export default function UnsubscribePreferences() {
  return <UnsubscribePreferencesPage />;
}
