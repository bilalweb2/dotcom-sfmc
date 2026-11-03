/**
 * UBBConfirmationLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UBBConfirmationCopyLayout({
  children,
}: LayoutProps<"/UBB-confirmation-Copy">) {
  return <PageLayout compact>{children}</PageLayout>;
}
