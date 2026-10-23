/**
 * UBBConfirmationLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UBBConfirmationLayout({
  children,
}: LayoutProps<"/unbreakable-wifi-confirmation">) {
  return <PageLayout compact>{children}</PageLayout>;
}
