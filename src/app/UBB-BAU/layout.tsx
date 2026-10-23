/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UBBLayout({ children }: LayoutProps<"/UBB-BAU">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
