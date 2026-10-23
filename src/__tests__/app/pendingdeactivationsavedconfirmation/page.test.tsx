/**
 * @file __tests__/app/pendingdeactivationsavedconfirmation/page.test.tsx
 * @description Unit tests for pending deactivation saved confirmation app page
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import PendingDeactivationSavedConfirmation, {
  metadata,
} from "@/app/pendingdeactivationsavedconfirmation/page";

describe("pendingdeactivationsavedconfirmation page", () => {
  it("exports the expected page metadata", () => {
    expect(metadata).toEqual({
      title: { absolute: "Frontier" },
      description:
        "Your Pending Disco-LP order is being processed. Your self-installation kit will arrive within 5-7 business days.",
    });
  });

  it("renders the confirmation and delivery information", () => {
    render(<PendingDeactivationSavedConfirmation />);

    expect(
      screen.getByRole("heading", {
        name: "Your order is being processed. Thank you!",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Service Order Confirmation email with your new service information/i,
      ),
    ).toBeInTheDocument();
  });
});
