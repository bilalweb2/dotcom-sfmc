import type { Metadata } from "next";
import { UBBv2Page } from "@/components/UBBv2Page";

export const metadata: Metadata = {
  title: "Frontier",
  description:
    "Stay connected during internet outages and extend Wi-Fi coverage throughout your home with Frontier Whole-Home Wi-Fi and Unbreakable Wi-Fi for only $35/mo.",
};

/**
 * Unbreakable Wi-Fi upgrade landing page — Server Component.
 * URL: /UBBv1
 */
export default function UBBv2WifiPage() {
  return (
    <UBBv2Page pageName="UBB-V3" Offer="WHWF $10/mo and Unbreakable $25/mo" />
  );
}
