/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { RootLayout } from "@/layouts/RootLayout/RootLayout";

describe("RootLayout", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders its children inside the error boundary", () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
    );

    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the error boundary fallback when a child throws", () => {
    function BrokenPage(): never {
      throw new Error("Page rendering failed");
    }

    render(
      <RootLayout>
        <BrokenPage />
      </RootLayout>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Page rendering failed")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "[ErrorBoundary] Uncaught error:",
      expect.objectContaining({ message: "Page rendering failed" }),
      expect.any(String),
    );
  });
});
