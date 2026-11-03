import type { Metadata } from "next";
import { ResidentialSalesPage } from "@/components/ResidentialSalesPage";

export const metadata: Metadata = {
  title: { absolute: "Frontier" },
  description:
    "residential-sales-team",
};

/**
 * PendingDiscoPage order confirmation page — Server Component.
 * URL: /residential-sales-team
 */
export default function pendingdeactivationsavedconfirmation() {
  return <ResidentialSalesPage/>;
}
