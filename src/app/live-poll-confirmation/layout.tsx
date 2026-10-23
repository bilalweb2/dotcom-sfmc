import { PageLayout } from "@/layouts/PageLayout/PageLayout";

export default function LivePollConfirmationLayout({
  children,
}: LayoutProps<"/live-poll-confirmation">) {
  return (
    <PageLayout
      compact
      showAudienceBar={false}
      showFooterColumns={false}
      showLivePollLegalLinks
    >
      {children}
    </PageLayout>
  );
}
