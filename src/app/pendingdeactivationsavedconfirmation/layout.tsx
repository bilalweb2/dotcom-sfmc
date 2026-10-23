/**
 * PendingDiscoPageConfirmationLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function PendingDiscoConfirmationLayout({
  children,
}: LayoutProps<"/pendingdeactivationsavedconfirmation">) {
  return <PageLayout compact>{children}</PageLayout>;
}
