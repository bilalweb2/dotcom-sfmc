/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

describe("ErrorBoundary", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders children when no error has occurred", () => {
    render(
      <ErrorBoundary>
        <p>Healthy content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Healthy content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the default fallback and reports a child render error", () => {
    function BrokenChild(): never {
      throw new Error("Render failed");
    }

    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Render failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "[ErrorBoundary] Uncaught error:",
      expect.objectContaining({ message: "Render failed" }),
      expect.any(String),
    );
  });

  it("renders the default message if a caught error has no message", () => {
    function BrokenChild(): never {
      throw new Error("");
    }

    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText("An unexpected error occurred. Please try again."),
    ).toBeInTheDocument();
  });

  it("uses a custom fallback and resets the boundary when requested", () => {
    let shouldThrow = true;

    function RecoverableChild() {
      if (shouldThrow) {
        throw new Error("Temporary failure");
      }
      return <p>Recovered content</p>;
    }

    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <p>{error.message}</p>
            <button onClick={reset}>Recover</button>
          </div>
        )}
      >
        <RecoverableChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Temporary failure")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Recover" }));

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
    expect(screen.queryByText("Temporary failure")).not.toBeInTheDocument();
  });

  it("resets the default fallback when Try again is clicked", () => {
    let shouldThrow = true;

    function RecoverableChild() {
      if (shouldThrow) {
        throw new Error("Temporary failure");
      }
      return <p>Recovered content</p>;
    }

    render(
      <ErrorBoundary>
        <RecoverableChild />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });
});
