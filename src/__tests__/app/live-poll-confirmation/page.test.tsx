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
        "Thank you for voting. Discover special rewards, offers and discounts for Frontier customers.",
    });
  });

  it("renders the vote confirmation and rewards headings", () => {
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
