/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import LivePollConfirmationLayout from "@/app/live-poll-confirmation/layout";

jest.mock("@/layouts/PageLayout/PageLayout", () => ({
  PageLayout: ({
    children,
    compact,
    showFooterColumns,
    showLivePollLegalLinks,
    showAudienceBar,
  }: {
    children: React.ReactNode;
    compact?: boolean;
    showFooterColumns?: boolean;
    showLivePollLegalLinks?: boolean;
    showAudienceBar?: boolean;
  }) => (
    <main
      data-compact={String(compact)}
      data-footer-columns={String(showFooterColumns)}
      data-live-poll-legal-links={String(showLivePollLegalLinks)}
      data-audience-bar={String(showAudienceBar)}
    >
      {children}
    </main>
  ),
}));

describe("LivePollConfirmationLayout", () => {
  it("renders its children with the live poll page layout options", () => {
    render(
      <LivePollConfirmationLayout params={Promise.resolve({})}>
        <h1>Live poll confirmed</h1>
      </LivePollConfirmationLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Live poll confirmed" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-footer-columns",
      "false",
    );
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-live-poll-legal-links",
      "true",
    );
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-audience-bar",
      "false",
    );
  });

  it("renders the layout when children are empty", () => {
    render(
      <LivePollConfirmationLayout params={Promise.resolve({})}>
        {null}
      </LivePollConfirmationLayout>,
    );

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
  });
});
