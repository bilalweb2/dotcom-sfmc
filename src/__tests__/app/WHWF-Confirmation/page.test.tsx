/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import WHWFConfirmation, {
  metadata,
} from "@/app/WHWF-Confirmation/page";

describe("WHWFConfirmation page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: { absolute: "Frontier" },
      description:
        "Your Whole-Home Wi-Fi order is being processed. Your self-installation kit will arrive within 5-7 business days.",
    });
  });

  it("renders the confirmation and delivery information", () => {
    render(<WHWFConfirmation />);

    expect(
      screen.getByRole("heading", {
        name: "Your order is being processed. Thank you!",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/self-installation kit should be delivered within 5-7 business days/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enjoy Wi-Fi coverage where you need it."),
    ).toBeInTheDocument();
  });
});
