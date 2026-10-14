/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import WHWFConfirmationLayout from "@/app/WHWF-Confirmation/layout";

jest.mock("@/layouts/PageLayout/PageLayout", () => ({
  PageLayout: ({
    children,
    compact,
  }: {
    children: React.ReactNode;
    compact?: boolean;
  }) => (
    <div>
      <header>Site header</header>
      <main data-compact={compact ? "true" : "false"}>{children}</main>
      <footer>Site footer</footer>
    </div>
  ),
}));

describe("WHWFConfirmationLayout", () => {
  it("renders children in compact mode with the shared header and footer", () => {
    render(
      <WHWFConfirmationLayout params={Promise.resolve({})}>
        <h1>Confirmation</h1>
      </WHWFConfirmationLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "Confirmation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Site footer");
  });

  it("renders the compact layout when children are empty", () => {
    render(
      <WHWFConfirmationLayout params={Promise.resolve({})}>{null}</WHWFConfirmationLayout>,
    );

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
