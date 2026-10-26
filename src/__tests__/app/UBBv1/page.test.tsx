/**
 * @file __tests__/app/UBBv1/page.test.tsx
 * @description Unit tests for the UBBv1 landing page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UBBv1WifiPage, { metadata } from "@/app/UBBv1/page";

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

describe("UBBv1WifiPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "Frontier",
      description:
        "Stay connected during internet outages with Frontier Unbreakable Wi-Fi. Only $25/mo.",
    });
  });

  it("renders UBBPage with UBB-V1 page name and offer", () => {
    render(<UBBv1WifiPage />);

    const page = screen.getByTestId("ubb-page");
    expect(page).toHaveAttribute("data-page-name", "UBB-V1");
    expect(page).toHaveAttribute(
      "data-offer",
      "Unbreakable - 1 mon free then $25/mo",
    );
    expect(page).toHaveAttribute("data-show-price", "false");
    expect(page).toHaveAttribute("data-offer-price", "true");
  });
});
