/**
 * @file __tests__/app/UBB-confirmation-Copy/page.test.tsx
 * @description Unit tests for the UBB confirmation copy landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBConfirmationCopyPage, {
  metadata,
} from "@/app/UBB-confirmation-Copy/page";

describe("UBBConfirmationCopyPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: { absolute: "Frontier" },
      description:
        "Your Unbreakable Wi-Fi order is being processed. You will receive a service order confirmation email with changes to your bill.",
    });
  });

  it("renders confirmation copy and optional battery backup CTA", () => {
    render(<UBBConfirmationCopyPage />);

    expect(
      screen.getByRole("heading", {
        name: "Your order is being processed. Thank you!",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /self-installation kit should be delivered within 5-7 business days/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Now you can enjoy peace of mind with a backup connection during network outages.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Optional battery back-up/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Order now" }),
    ).toHaveAttribute(
      "href",
      "https://cpeportal.com/frontier/unbreakable-wi-fi-bbu/c-444.html",
    );
  });
});
