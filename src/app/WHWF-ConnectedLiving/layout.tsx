/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function WHWFConnectedLivingLayout({ children }: LayoutProps<"/WHWF-ConnectedLiving">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
