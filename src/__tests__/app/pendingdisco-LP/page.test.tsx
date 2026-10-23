/**
 * @file __tests__/app/pendingdisco-LP/page.test.tsx
 * @description Unit tests for Pending Disco landing page app route
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import PendingDiscoLP, { metadata } from "@/app/pendingdisco-LP/page";

jest.mock("@/components/PendingDisPage", () => ({
  PendingDisPage: ({ pageName }: { pageName: string }) => (
    <div data-testid="pending-dis-page" data-page-name={pageName} />
  ),
}));

describe("PendingDiscoLP page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
      description:
        "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
    });
  });

  it("renders PendingDisPage with the Save from disconnecting page name", () => {
    render(<PendingDiscoLP />);

    expect(screen.getByTestId("pending-dis-page")).toHaveAttribute(
      "data-page-name",
      "Save from disconnecting",
    );
  });
});
