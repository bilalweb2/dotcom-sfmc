/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function WHWFLayout({
  children,
}: LayoutProps<"/WHWF-followup">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
