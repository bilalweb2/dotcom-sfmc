/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import WHWF012025Page, { metadata } from "@/app/WHWF012025/page";

jest.mock("@/components/WHWFPage", () => ({
  WHWFPage: ({ pageName }: { pageName: string }) => (
    <div data-testid="whwf-page" data-page-name={pageName} />
  ),
}));

describe("WHWF012025Page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
      description:
        "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
    });
  });

  it("renders the Whole-Home Wi-Fi page with the correct page name", () => {
    render(<WHWF012025Page />);

    expect(screen.getByTestId("whwf-page")).toHaveAttribute(
      "data-page-name",
      "BAU WHWF - v1",
    );
  });
});
