/**
 * ForMeRewardsLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function ForMeRewardsLayout({
  children,
}: LayoutProps<"/ForMeRewards">) {
  return <PageLayout compact>{children}</PageLayout>;
}
