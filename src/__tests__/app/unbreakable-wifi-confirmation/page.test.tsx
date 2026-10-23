/**
 * @file __tests__/app/unbreakable-wifi-confirmation/page.test.tsx
 * @description Unit tests for the Unbreakable Wi-Fi confirmation page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBConfirmation, {
  metadata,
} from "@/app/unbreakable-wifi-confirmation/page";

describe("UBBConfirmation page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: { absolute: "Frontier" },
      description:
        "Your Unbreakable Wi-Fi order is being processed. You will receive a service order confirmation email with changes to your bill.",
    });
  });

  it("renders the confirmation heading and UBB-specific tagline", () => {
    render(<UBBConfirmation />);

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
  });
});
