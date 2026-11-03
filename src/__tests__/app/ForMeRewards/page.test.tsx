/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ForMeRewardsPage, { metadata } from "@/app/ForMeRewards/page";

jest.mock("@/components/ForMeRewardsPage", () => ({
  ForMeRewardsPage: () => <div data-testid="for-me-rewards-page" />,
}));

describe("ForMeRewardsPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
      description:
        "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
    });
  });

  it("renders the For Me Rewards page component", () => {
    render(<ForMeRewardsPage />);

    expect(screen.getByTestId("for-me-rewards-page")).toBeInTheDocument();
  });
});
