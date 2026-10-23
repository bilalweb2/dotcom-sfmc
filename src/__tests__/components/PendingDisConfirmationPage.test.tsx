/**
 * @file __tests__/components/PendingDisConfirmationPage.test.tsx
 * @description Unit tests for PendingDisConfirmationPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { PendingDisConfirmationPage } from "@/components/PendingDisConfirmationPage";

describe("PendingDisConfirmationPage", () => {
  it("renders the confirmation heading", () => {
    render(<PendingDisConfirmationPage />);

    expect(
      screen.getByRole("heading", {
        name: "Your order is being processed. Thank you!",
      }),
    ).toBeInTheDocument();
  });

  it("renders the service order confirmation message", () => {
    render(<PendingDisConfirmationPage />);

    expect(
      screen.getByText(
        /Service Order Confirmation email with your new service information/i,
      ),
    ).toBeInTheDocument();
  });

  it("associates the banner section with the confirmation heading", () => {
    render(<PendingDisConfirmationPage />);

    const heading = screen.getByRole("heading", {
      name: "Your order is being processed. Thank you!",
    });
    const section = heading.closest("section");

    expect(section).toHaveAttribute("aria-labelledby", "confirmation-heading");
    expect(heading).toHaveAttribute("id", "confirmation-heading");
  });
});
