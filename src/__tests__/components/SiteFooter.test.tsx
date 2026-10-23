/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";

describe("SiteFooter", () => {
  let originalAppUrl: string | undefined;

  beforeEach(() => {
    originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    // delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      // delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("renders each footer column with its complete set of links", () => {
    render(<SiteFooter />);

    const columns = [
      { heading: "Shop", linkCount: 9 },
      { heading: "My Account", linkCount: 6 },
      { heading: "Support", linkCount: 6 },
      { heading: "Corporate", linkCount: 7 },
      { heading: "Frontier Sites", linkCount: 6 },
      { heading: "Sales Partners", linkCount: 2 },
    ];

    for (const { heading, linkCount } of columns) {
      const toggle = screen.getByRole("button", { name: heading });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(
        within(toggle.parentElement as HTMLElement).getAllByRole("link"),
      ).toHaveLength(linkCount);
    }

    expect(
      screen.getByRole("link", { name: "Fiber Internet" }),
    ).toHaveAttribute(
      "href",
      "https://frontier.com/shop/internet/fiber-internet",
    );
  });

  it("opens a column, closes it when clicked again, and switches between columns", () => {
    render(<SiteFooter />);

    const shop = screen.getByRole("button", { name: "Shop" });
    const support = screen.getByRole("button", { name: "Support" });

    fireEvent.click(shop);
    expect(shop).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(shop);
    expect(shop).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(shop);
    fireEvent.click(support);
    expect(shop).toHaveAttribute("aria-expanded", "false");
    expect(support).toHaveAttribute("aria-expanded", "true");
  });

  it("renders legal links, social links, and secure external-link attributes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://static.example.test";
    render(<SiteFooter />);

    const legalNav = screen.getByRole("navigation", { name: "Footer legal" });
    expect(within(legalNav).getAllByRole("link")).toHaveLength(6);
    expect(
      within(legalNav).getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "https://frontier.com/corporate/privacy-policy");

    const socialLabels = ["X", "Facebook", "LinkedIn", "YouTube", "Instagram"];
    for (const label of socialLabels) {
      const socialLink = screen.getByRole("link", { name: label });
      expect(socialLink).toHaveAttribute("target", "_blank");
      expect(socialLink).toHaveAttribute("rel", "noopener noreferrer");
      expect(socialLink.querySelector("img")).toHaveAttribute(
        "src",
        expect.stringContaining(
          "https://static.example.test/images/svg/social/",
        ),
      );
    }

    expect(
      screen.getByText(`© ${new Date().getFullYear()} Verizon`),
    ).toBeInTheDocument();
  });

  it("uses a relative social image path when no public app URL is configured", () => {
    // delete process.env.NEXT_PUBLIC_APP_URL;
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: "X" }).querySelector("img"),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("/images/svg/social/x.svg"),
    );
  });
});
