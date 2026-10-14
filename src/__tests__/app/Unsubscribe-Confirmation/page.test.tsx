/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UnsubscribeConfirmation, {
  metadata,
} from "@/app/Unsubscribe-Confirmation/page";

describe("UnsubscribeConfirmation page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Frontier",
      description:
        "Your unsubscribe request has been received. Please allow up to 72 hours for processing.",
    });
  });

  it("renders the unsubscribe confirmation and processing information", () => {
    render(<UnsubscribeConfirmation />);

    expect(
      screen.getByRole("heading", { name: "You are all set." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please allow up to 72 hours for processing."),
    ).toBeInTheDocument();
  });
});
