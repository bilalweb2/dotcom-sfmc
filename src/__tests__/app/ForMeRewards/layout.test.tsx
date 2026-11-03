/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import ForMeRewardsLayout from "@/app/ForMeRewards/layout";

jest.mock("@/layouts/PageLayout/PageLayout", () => ({
  PageLayout: ({
    children,
    compact,
    showFooter,
  }: {
    children: React.ReactNode;
    compact?: boolean;
    showFooter?: boolean;
  }) => (
    <div>
      <header>Site header</header>
      <main data-compact={compact ? "true" : "false"}>{children}</main>
      {showFooter !== false && <footer>Site footer</footer>}
    </div>
  ),
}));

describe("ForMeRewardsLayout", () => {
  it("renders its children with the header and without the footer", () => {
    render(
      <ForMeRewardsLayout params={Promise.resolve({})}>
        <h1>For Me Rewards</h1>
      </ForMeRewardsLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "For Me Rewards" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "false");
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });

  it("renders the layout shell when children are empty", () => {
    render(
      <ForMeRewardsLayout params={Promise.resolve({})}>{null}</ForMeRewardsLayout>,
    );

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });
});
