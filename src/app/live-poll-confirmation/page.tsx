import type { Metadata } from "next";
import { LivePollConfirmationPage } from "@/components/LivePollConfirmationPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "Thank you for voting. Discover special rewards, offers and discounts for Frontier customers.",
};

export default function LivePollConfirmation() {
  return <LivePollConfirmationPage />;
}
