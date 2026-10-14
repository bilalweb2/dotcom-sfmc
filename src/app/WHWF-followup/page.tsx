import type { Metadata } from "next";
import { WHWFPage } from "@/components/WHWFPage";

export const metadata: Metadata = {
  title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
  description:
    "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
};

/**
 * Whole-Home Wi-Fi upgrade landing page — Server Component.
 * URL: /WHWF012025
 */
export default function WHWF012025Page() {
  return <WHWFPage pageName="WHWF-followup" />;
}
