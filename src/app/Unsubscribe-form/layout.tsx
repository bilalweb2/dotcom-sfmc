/**
 * UnsubscribeFormLayout — uses PageLayout with header and full site footer.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UnsubscribeFormLayout({
  children,
}: LayoutProps<"/Unsubscribe-form">) {
  return <PageLayout compact>{children}</PageLayout>;
}
