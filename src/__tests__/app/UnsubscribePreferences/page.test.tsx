/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import UnsubscribePreferences, {
  metadata,
} from "@/app/UnsubscribePreferences/page";

jest.mock("@/components/UnsubscribePreferencesPage", () => ({
  UnsubscribePreferencesPage: () => <h1>Email preferences content</h1>,
}));

describe("UnsubscribePreferences page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: "We're Sorry to See You Go | Frontier",
      description:
        "Select the types of emails you would no longer like to receive from Frontier, and we will take care of the rest.",
    });
  });

  it("renders the unsubscribe preferences page component", () => {
    render(<UnsubscribePreferences />);

    expect(
      screen.getByRole("heading", { name: "Email preferences content" }),
    ).toBeInTheDocument();
  });
});
