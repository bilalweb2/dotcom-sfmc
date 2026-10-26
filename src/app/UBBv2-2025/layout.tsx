/**
 * WHWFLayout — uses PageLayout to provide the shared SiteHeader and SiteFooter.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UBBv2Layout({ children }: LayoutProps<"/UBBv2-2025">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
