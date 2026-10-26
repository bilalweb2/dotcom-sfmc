/**
 * @file __tests__/app/UBBv2-2025/page.test.tsx
 * @description Unit tests for the UBBv2-2025 landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBv2WifiPage, { metadata } from "@/app/UBBv2-2025/page";

jest.mock("@/components/UBBv2Page", () => ({
  UBBv2Page: ({ pageName, Offer }: { pageName: string; Offer: string }) => (
    <div
      data-testid="ubbv2-page"
      data-page-name={pageName}
      data-offer={Offer}
    />
  ),
}));

describe("UBBv2WifiPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Frontier",
      description:
        "Stay connected during internet outages and extend Wi-Fi coverage throughout your home with Frontier Whole-Home Wi-Fi and Unbreakable Wi-Fi for only $35/mo.",
    });
  });

  it("renders UBBv2Page with UBB-V3 page name and combined offer", () => {
    render(<UBBv2WifiPage />);

    const page = screen.getByTestId("ubbv2-page");
    expect(page).toHaveAttribute("data-page-name", "UBB-V3");
    expect(page).toHaveAttribute(
      "data-offer",
      "WHWF $10/mo and Unbreakable $25/mo",
    );
  });
});
