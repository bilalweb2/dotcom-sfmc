/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { LivePollConfirmationPage } from "@/components/LivePollConfirmationPage/LivePollConfirmationPage";

describe("LivePollConfirmationPage", () => {
  it("renders the vote confirmation and rewards information", () => {
    render(<LivePollConfirmationPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Thank you for your vote!",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Thank you for your vote!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "For Me Rewards" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "For Me Rewards" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Don't miss out on special rewards, offers and discounts just for Frontier customers!",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "There's always something new happening in ForMe Rewards. Stop by to browse the latest limited-time deals and see what's waiting for you.",
      ),
    ).toBeInTheDocument();
  });

  it("does not show an error alert on the confirmation page", () => {
    render(<LivePollConfirmationPage />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders three decorative stripes", () => {
    const { container } = render(<LivePollConfirmationPage />);
    const sections = container.querySelectorAll("section");
    const stripes = sections[2];

    expect(stripes.children).toHaveLength(3);
  });

  it("renders the app call to action with the rewards link", () => {
    render(<LivePollConfirmationPage />);

    const ctaHeading = screen.getByRole("heading", {
      level: 2,
      name: "Open or download the MyFrontier app now!",
    });
    const ctaSection = ctaHeading.closest("section");

    expect(ctaSection).not.toBeNull();
    expect(
      within(ctaSection as HTMLElement).getByRole("link", {
        name: "View Rewards",
      }),
    ).toHaveAttribute(
      "href",
      "https://frontier.com/resources/myfrontier-mobile-app",
    );
  });
});
