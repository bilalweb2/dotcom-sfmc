/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UBBv1Layout({ children }: LayoutProps<"/UBBv1">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
