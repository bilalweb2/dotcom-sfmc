/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function WHWFLayout({ children }: LayoutProps<"/WHWF012025">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
