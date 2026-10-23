/**
 * @file __tests__/app/UBB-BAU/page.test.tsx
 * @description Unit tests for the UBB-BAU landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBWifiPage, { metadata } from "@/app/UBB-BAU/page";

jest.mock("@/components/UBBPage", () => ({
  UBBPage: ({ pageName }: { pageName: string }) => (
    <div data-testid="ubb-page" data-page-name={pageName} />
  ),
}));

describe("UBBBauPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Frontier",
      description:
        "Stay connected during internet outages with Frontier Unbreakable Wi-Fi. Only $25/mo.",
    });
  });

  it("renders the UBB page with the connected living page name", () => {
    render(<UBBWifiPage />);

    expect(screen.getByTestId("ubb-page")).toHaveAttribute(
      "data-page-name",
      "UBB-Connected Living",
    );
  });
});
