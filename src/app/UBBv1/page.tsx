import type { Metadata } from "next";
import { UBBPage } from "@/components/UBBPage";

export const metadata: Metadata = {
  title: "Frontier",
  description:
    "Stay connected during internet outages with Frontier Unbreakable Wi-Fi. Only $25/mo.",
};

/**
 * Unbreakable Wi-Fi upgrade landing page — Server Component.
 * URL: /UBBv1
 */
export default function UBBv1WifiPage() {
  return (
    <UBBPage
      pageName="UBB-V1"
      Offer="Unbreakable - 1 mon free then $25/mo"
      showPrice={false}
      offerPrice={true}
    />
  );
}
