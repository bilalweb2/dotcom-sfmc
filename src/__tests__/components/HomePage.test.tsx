/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/components/HomePage/HomePage";

jest.mock("@/components/SiteHeader", () => ({
  SiteHeader: () => <header>Site header</header>,
}));

jest.mock("@/components/SiteFooter", () => ({
  SiteFooter: () => <footer>Site footer</footer>,
}));

describe("HomePage", () => {
  it("renders the shared page layout with its header, main content, and footer", () => {
    render(<HomePage />);

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Site footer");
  });
});
