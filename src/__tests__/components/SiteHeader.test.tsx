/**
 * @jest-environment jsdom
 */

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

describe("SiteHeader", () => {
  const originalMatchMedia = window.matchMedia;
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("renders audience navigation, site navigation, sign-in links, and logos", () => {
    render(<SiteHeader />);

    const audienceNavigation = screen.getByRole("navigation", {
      name: "Audience",
    });
    expect(
      within(audienceNavigation).getByRole("link", { name: "Residential" }),
    ).toHaveAttribute("href", "https://frontier.com/");
    expect(
      within(audienceNavigation).getAllByRole("link"),
    ).toHaveLength(4);

    const siteNavigation = screen.getByRole("navigation", {
      name: "Site Navigation",
    });
    expect(
      within(siteNavigation).getByRole("button", { name: "Shop" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(siteNavigation).getByRole("button", { name: "Why Frontier" }),
    ).toBeInTheDocument();
    expect(
      within(siteNavigation).getByRole("button", { name: "Support" }),
    ).toBeInTheDocument();
    expect(
      within(siteNavigation)
        .getAllByRole("link", { name: "Deals" })
        .find((link) => link.getAttribute("href") === "https://frontier.com/shop/deals"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign In/Register", hidden: true }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: "Sign In", hidden: true }),
    ).toHaveAttribute("href", "https://frontier.com/login");

    const logoLink = screen.getByRole("link", {
      name: "Frontier, a Verizon Company",
    });
    expect(logoLink.querySelectorAll("img")).toHaveLength(2);
    expect(logoLink.querySelector('img[src="/images/svg/site-desktop-logo-verizon.svg"]')).toBeInTheDocument();
    expect(logoLink.querySelector('img[src="/images/svg/site-mobile-logo-verizon.svg"]')).toBeInTheDocument();
  });

  it("toggles the mobile menu and resets any open submenu", () => {
    render(<SiteHeader />);

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuButton);

    const closeButton = screen.getByRole("button", { name: "Close menu" });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");

    const shop = screen.getByRole("button", { name: "Shop" });
    fireEvent.click(shop);
    expect(shop).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(closeButton);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(shop).toHaveAttribute("aria-expanded", "false");
  });

  it("opens, closes, and switches mobile dropdowns", () => {
    render(<SiteHeader />);

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

  it("does not toggle dropdown state at desktop viewport width", () => {
    matchMediaMock.mockReturnValue({ matches: true });
    render(<SiteHeader />);

    const shop = screen.getByRole("button", { name: "Shop" });
    fireEvent.click(shop);

    expect(shop).toHaveAttribute("aria-expanded", "false");
    expect(matchMediaMock).toHaveBeenCalledWith("(min-width: 1024px)");
  });

  it("closes mobile navigation after selecting nested or direct navigation links", () => {
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Shop" }));
    fireEvent.click(screen.getByRole("link", { name: "7 Gig" }));

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Shop" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(
      screen
        .getAllByRole("link", { name: "Deals" })
        .find((link) => link.getAttribute("href") === "https://frontier.com/shop/deals")!,
    );

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("applies the scrolled state and removes its scroll listener on unmount", () => {
    const { container, unmount } = render(<SiteHeader />);
    const root = container.firstElementChild as HTMLElement;
    const initialClassName = root.className;

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 10,
    });
    fireEvent.scroll(window);
    expect(root.className).not.toBe(initialClassName);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
    fireEvent.scroll(window);
    expect(root.className).toBe(initialClassName);

    unmount();
    fireEvent.scroll(window);
  });
});
