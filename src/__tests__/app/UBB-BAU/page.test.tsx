/**
 * @file __tests__/app/UBB-BAU/page.test.tsx
 * @description Unit tests for the UBB-BAU landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBWifiPage, { metadata } from "@/app/UBB-BAU/page";

jest.mock("@/components/UBBPage", () => ({
  UBBPage: ({
    pageName,
    Offer,
    showPrice,
    offerPrice,
  }: {
    pageName: string;
    Offer: string;
    showPrice?: boolean;
    offerPrice?: boolean;
  }) => (
    <div
      data-testid="ubb-page"
      data-page-name={pageName}
      data-offer={Offer}
      data-show-price={String(showPrice)}
      data-offer-price={String(offerPrice)}
    />
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

  it("renders UBBPage with connected living page name and offer", () => {
    render(<UBBWifiPage />);

    const page = screen.getByTestId("ubb-page");
    expect(page).toHaveAttribute("data-page-name", "UBB-Connected Living");
    expect(page).toHaveAttribute("data-offer", "Unbreakable $25/mo");
    expect(page).toHaveAttribute("data-show-price", "true");
    expect(page).toHaveAttribute("data-offer-price", "false");
  });
});
