/**
 * LivePollConfirmationLayout — uses PageLayout with the footer link columns hidden.
 */
import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function LivePollConfirmationLayout({
  children,
}: LayoutProps<"/live-poll-confirmation">) {
  return (
    <PageLayout
      compact
      showFooterColumns={false}
      showLivePollLegalLinks
      showAudienceBar={false}
    >
      {children}
    </PageLayout>
  );
}
