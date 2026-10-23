/**
 * @file __tests__/app/pendingdisco-LP/layout.test.tsx
 * @description Unit tests for Pending Disco landing page layout
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import PendingDiscoLayout from "@/app/pendingdisco-LP/layout";

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

describe("PendingDiscoLayout", () => {
  it("renders its children with the header and without the footer", () => {
    render(
      <PendingDiscoLayout params={Promise.resolve({})}>
        <h1>Pending Disco</h1>
      </PendingDiscoLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "Pending Disco" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "false");
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });

  it("renders the layout shell when children are empty", () => {
    render(
      <PendingDiscoLayout params={Promise.resolve({})}>
        {null}
      </PendingDiscoLayout>,
    );

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });
});
