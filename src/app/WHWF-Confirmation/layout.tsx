/**
 * WHWFConfirmationLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function WHWFConfirmationLayout({
  children,
}: LayoutProps<"/WHWF-Confirmation">) {
  return <PageLayout compact>{children}</PageLayout>;
}
