/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UnsubscribePreferencesLayout from "@/app/UnsubscribePreferences/layout";

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

describe("UnsubscribePreferencesLayout", () => {
  it("renders children in compact mode with the shared header and footer", () => {
    render(
      <UnsubscribePreferencesLayout params={Promise.resolve({})}>
        <h1>Email preferences</h1>
      </UnsubscribePreferencesLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "Email preferences" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Site footer");
  });

  it("renders the compact layout when children are empty", () => {
    render(
      <UnsubscribePreferencesLayout params={Promise.resolve({})}>
        {null}
      </UnsubscribePreferencesLayout>,
    );

    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.getByRole("main")).toHaveAttribute("data-compact", "true");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
