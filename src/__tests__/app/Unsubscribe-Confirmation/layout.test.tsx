/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UnsubscribeConfirmationLayout from "@/app/Unsubscribe-Confirmation/layout";

jest.mock("@/components/SiteHeader", () => ({
  SiteHeader: () => <header>Site header</header>,
}));

jest.mock("@/components/SiteFooter", () => ({
  SiteFooter: () => <footer>Site footer</footer>,
}));

describe("UnsubscribeConfirmationLayout", () => {
  it("renders its children with the header and without the footer", () => {
    render(
      <UnsubscribeConfirmationLayout params={Promise.resolve({})}>
        <h1>Unsubscribe confirmed</h1>
      </UnsubscribeConfirmationLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(
      screen.getByRole("heading", { name: "Unsubscribe confirmed" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });

  it("renders the layout shell when children are empty", () => {
    render(
      <UnsubscribeConfirmationLayout params={Promise.resolve({})}>
        {null}
      </UnsubscribeConfirmationLayout>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(screen.getByRole("main")).toBeEmptyDOMElement();
    expect(screen.queryByText("Site footer")).not.toBeInTheDocument();
  });
});
