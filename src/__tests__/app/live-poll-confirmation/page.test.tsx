/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import LivePollConfirmation, {
  metadata,
} from "@/app/live-poll-confirmation/page";

describe("LivePollConfirmation page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: { absolute: "Frontier" },
      description:
        "Your Whole-Home Wi-Fi order is being processed. Your self-installation kit will arrive within 5-7 business days.",
    });
  });

  it("renders the live poll confirmation page", () => {
    render(<LivePollConfirmation />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Thank you for your vote!",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "For Me Rewards" }),
    ).toBeInTheDocument();
  });
});
