/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders the error state and reference digest when provided", () => {
    const error = Object.assign(new Error("Server failure"), {
      digest: "err-123",
    });

    render(<ErrorPage error={error} reset={jest.fn()} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /An unexpected error occurred\. Our team has been notified\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("err-123")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "[ErrorPage]",
      "Server failure",
      "err-123",
    );
  });

  it("omits the reference when there is no digest and logs an empty reference", () => {
    render(
      <ErrorPage error={new Error("Unknown failure")} reset={jest.fn()} />,
    );

    expect(screen.queryByText(/Reference:/)).not.toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      "[ErrorPage]",
      "Unknown failure",
      "",
    );
  });

  it("calls reset when Try again is clicked", () => {
    const reset = jest.fn();
    render(<ErrorPage error={new Error("Retryable failure")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("provides a link to the home page", () => {
    render(<ErrorPage error={new Error("Failure")} reset={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Go to Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
