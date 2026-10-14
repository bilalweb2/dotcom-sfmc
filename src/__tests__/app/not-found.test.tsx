/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import NotFound, { metadata } from "@/app/not-found";

jest.mock("@/layouts/PageLayout/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

describe("NotFound page", () => {
  it("exports the expected 404 metadata", () => {
    expect(metadata).toEqual({
      title: "404 — Page Not Found",
      description: "The page you are looking for could not be found.",
    });
  });

  it("renders the not-found message and home link", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The page you're looking for doesn't exist or may have been moved."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
