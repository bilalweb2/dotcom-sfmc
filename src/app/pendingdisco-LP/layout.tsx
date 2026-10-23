/**
 * PendingDiscoLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function PendingDiscoLayout({
  children,
}: LayoutProps<"/pendingdisco-LP">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
