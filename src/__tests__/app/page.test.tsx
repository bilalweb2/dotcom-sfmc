/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import Home, { metadata } from "@/app/page";

jest.mock("@/components/HomePage", () => ({
  HomePage: () => <h1>Home page content</h1>,
}));

describe("Home page", () => {
  it("exports the expected metadata", () => {
    expect(metadata).toEqual({ title: "Home" });
  });

  it("renders the HomePage component", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Home page content" }),
    ).toBeInTheDocument();
  });
});
