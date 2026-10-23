import type { Metadata } from "next";
import { UBBPage } from "@/components/UBBPage";

export const metadata: Metadata = {
  title: "Frontier",
  description:
    "Stay connected during internet outages with Frontier Unbreakable Wi-Fi. Only $25/mo.",
};

/**
 * Unbreakable Wi-Fi upgrade landing page — Server Component.
 * URL: /UBB-BAU
 */
export default function UBBWifiPage() {
  return <UBBPage pageName="UBB-Connected Living" />;
}
