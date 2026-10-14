/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import WHWFLayout from "@/app/WHWF-followup/layout";

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

describe("WHWFLayout", () => {
  it("renders children with the header, without compact mode or footer", () => {
    render(
      <WHWFLayout params={Promise.resolve({})}>
        <h1>Whole-Home Wi-Fi follow-up</h1>
      </WHWFLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "Whole-Home Wi-Fi follow-up" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "false");
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });

  it("renders the layout shell when children are empty", () => {
    render(<WHWFLayout params={Promise.resolve({})}>{null}</WHWFLayout>);

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });
});
