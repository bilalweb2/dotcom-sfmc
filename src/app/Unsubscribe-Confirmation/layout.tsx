/**
 * UnsubscribeConfirmationLayout — uses PageLayout with header only; no site footer.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UnsubscribeConfirmationLayout({
  children,
}: LayoutProps<"/Unsubscribe-Confirmation">) {
  return <PageLayout showFooter={false}>{children}</PageLayout>;
}
