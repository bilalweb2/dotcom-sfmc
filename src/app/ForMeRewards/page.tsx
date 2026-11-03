import type { Metadata } from "next";
import { ForMeRewardsPage } from "@/components/ForMeRewardsPage";

export const metadata: Metadata = {
  title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
  description:
    "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
};

/**
 * For Me Rewards Whole-Home Wi-Fi landing page — Server Component.
 * URL: /ForMeRewards
 */
export default function ForMeRewardsRoutePage() {
  return <ForMeRewardsPage />;
}
