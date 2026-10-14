/**
 * UnsubscribePreferencesLayout — uses PageLayout with header and full site footer.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function UnsubscribePreferencesLayout({
  children,
}: LayoutProps<"/UnsubscribePreferences">) {
  return <PageLayout compact>{children}</PageLayout>;
}
