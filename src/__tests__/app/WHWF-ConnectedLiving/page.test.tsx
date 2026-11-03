/**
 * @file __tests__/app/WHWF-ConnectedLiving/page.test.tsx
 * @description Unit tests for the WHWF Connected Living landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import WHWFConnectedLivingPage, {
  metadata,
} from "@/app/WHWF-ConnectedLiving/page";

jest.mock("@/components/WHWFPage", () => ({
  WHWFPage: ({ pageName }: { pageName: string }) => (
    <div data-testid="whwf-page" data-page-name={pageName} />
  ),
}));

describe("WHWFConnectedLivingPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Upgrade Your Wi-Fi | Whole-Home Wi-Fi",
      description:
        "Extend your Wi-Fi coverage with Frontier Whole-Home Wi-Fi. Pay $0 for the first month, then only $10/mo. after.",
    });
  });

  it("renders WHWFPage with the Connected Living page name", () => {
    render(<WHWFConnectedLivingPage />);

    expect(screen.getByTestId("whwf-page")).toHaveAttribute(
      "data-page-name",
      "BAU WHWF - Connected Living/July WHWF",
    );
  });
});
