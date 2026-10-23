import type { Metadata } from "next";
import { PendingDisPage } from "@/components/PendingDisPage";

export const metadata: Metadata = {
  title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
  description:
    "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
};

/**
 * PendingDisco upgrade landing page — Server Component.
 * URL: /PendingDiscoPage
 */
export default function PendingDiscoLP() {
  return <PendingDisPage pageName="Save from disconnecting" />;
}
