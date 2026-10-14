/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UnsubscribeFormPage, { metadata } from "@/app/Unsubscribe-form/page";

jest.mock("@/components/UnsubscribePage", () => ({
  UnsubscribePage: () => <h1>Email unsubscribe form</h1>,
}));

describe("UnsubscribeFormPage", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "We're Sorry to See You Go | Frontier",
      description:
        "Enter your email address to unsubscribe from Frontier communications. Your request will be processed within 72 hours.",
    });
  });

  it("renders the unsubscribe page component", () => {
    render(<UnsubscribeFormPage />);

    expect(
      screen.getByRole("heading", { name: "Email unsubscribe form" }),
    ).toBeInTheDocument();
  });
});
