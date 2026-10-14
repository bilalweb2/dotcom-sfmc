/**
 * @file __tests__/components/UnsubscribePreferencesPage.test.tsx
 * @description Unit tests for UnsubscribePreferencesPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { UnsubscribePreferencesPage } from "@/components/UnsubscribePreferencesPage";

// ── Mocks ─────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

global.fetch = jest.fn();

// ── Tests ─────────────────────────────────────────────────────────────────
describe("UnsubscribePreferencesPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the page heading", () => {
      render(<UnsubscribePreferencesPage />);

      expect(
        screen.getByRole("heading", { name: /We're sorry to see you go/i }),
      ).toBeInTheDocument();
    });

    it("renders the subtext with preference instructions", () => {
      render(<UnsubscribePreferencesPage />);

      expect(
        screen.getByText(/control of the types of emails/i),
      ).toBeInTheDocument();
    });

    it("renders the email input field", () => {
      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("renders all preference checkboxes", () => {
      render(<UnsubscribePreferencesPage />);

      expect(screen.getByLabelText(/Added Protection/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Helpful Tips/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Internet Upgrades/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/New Products/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Newsletters/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Refer-a-Friend/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Rewards Program/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Special Offers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Wi-Fi Enhancements/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/YouTube TV/i)).toBeInTheDocument();
    });

    it("renders Unsubscribe from All master toggle", () => {
      render(<UnsubscribePreferencesPage />);

      expect(
        screen.getByLabelText(/Unsubscribe from all email categories/i),
      ).toBeInTheDocument();
    });

    it("renders the unsubscribe button", () => {
      render(<UnsubscribePreferencesPage />);

      expect(
        screen.getByRole("button", { name: /UNSUBSCRIBE/i }),
      ).toBeInTheDocument();
    });

    it("renders sublabels for certain preferences", () => {
      render(<UnsubscribePreferencesPage />);

      expect(
        screen.getByText(/ID protection, Total Shield/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/eero, Whole-Home Wifi/i)).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("displays error when email is empty", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Email address is required/i),
        ).toBeInTheDocument();
      });
    });

    it("displays error when email is invalid", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "invalid-email");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid email address/i),
        ).toBeInTheDocument();
      });
    });

    it("displays error when no preferences are selected", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/at least one/i)).toBeInTheDocument();
      });
    });
  });

  describe("preference selection and toggling", () => {
    it("allows selecting individual preferences", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });

      expect(addedProtectionCheckbox).not.toBeChecked();
      await user.click(addedProtectionCheckbox);
      expect(addedProtectionCheckbox).toBeChecked();
    });

    it("selecting 'Unsubscribe from All' checks all preferences", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const unsubscribeAllCheckbox = screen.getByLabelText(
        /Unsubscribe from all email categories/i,
      );
      await user.click(unsubscribeAllCheckbox);

      expect(screen.getByLabelText(/Added Protection/i)).toBeChecked();
      expect(screen.getByLabelText(/Helpful Tips/i)).toBeChecked();
      expect(screen.getByLabelText(/Internet Upgrades/i)).toBeChecked();
      expect(screen.getByLabelText(/New Products/i)).toBeChecked();
      expect(screen.getByLabelText(/Newsletters/i)).toBeChecked();
      expect(screen.getByLabelText(/Refer-a-Friend/i)).toBeChecked();
      expect(screen.getByLabelText(/Rewards Program/i)).toBeChecked();
      expect(screen.getByLabelText(/Special Offers/i)).toBeChecked();
      expect(screen.getByLabelText(/Wi-Fi Enhancements/i)).toBeChecked();
      expect(screen.getByLabelText(/YouTube TV/i)).toBeChecked();
    });

    it("unchecking 'Unsubscribe from All' unchecks all preferences", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const unsubscribeAllCheckbox = screen.getByLabelText(
        /Unsubscribe from all email categories/i,
      );

      // First check all
      await user.click(unsubscribeAllCheckbox);
      expect(unsubscribeAllCheckbox).toBeChecked();

      // Then uncheck all
      await user.click(unsubscribeAllCheckbox);
      expect(unsubscribeAllCheckbox).not.toBeChecked();

      expect(screen.getByLabelText(/Added Protection/i)).not.toBeChecked();
      expect(screen.getByLabelText(/Helpful Tips/i)).not.toBeChecked();
    });

    it("checks 'Unsubscribe from All' when all preferences are checked individually", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const unsubscribeAllCheckbox = screen.getByLabelText(
        /Unsubscribe from all email categories/i,
      );

      // Get all preference checkboxes
      const allCheckboxes = screen.getAllByRole("checkbox").slice(0, -1); // Exclude master toggle

      // Check all individually
      for (const checkbox of allCheckboxes) {
        await user.click(checkbox);
      }

      // Master toggle should now be checked
      expect(unsubscribeAllCheckbox).toBeChecked();
    });

    it("unchecks 'Unsubscribe from All' when any preference is unchecked", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const unsubscribeAllCheckbox = screen.getByLabelText(
        /Unsubscribe from all email categories/i,
      );
      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });

      // Check all
      await user.click(unsubscribeAllCheckbox);
      expect(unsubscribeAllCheckbox).toBeChecked();

      // Uncheck one preference
      await user.click(addedProtectionCheckbox);

      // Master toggle should now be unchecked
      expect(unsubscribeAllCheckbox).not.toBeChecked();
    });
  });

  describe("form submission", () => {
    it("submits form with email and selected preferences", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/ftr-forms/api/Unsubscribe-Form-Processing",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }),
        );
      });
    });

    it("sends correct request body with all preferences", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const unsubscribeAllCheckbox = screen.getByLabelText(
        /Unsubscribe from all email categories/i,
      );
      await user.click(unsubscribeAllCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = call[1].body;

        expect(body).toContain("EmailAddress=test%40example.com");
        expect(body).toContain("unsubscribedtoAddedProtection=true");
        expect(body).toContain("unsubscribedtoHelpfulTips=true");
        expect(body).toContain("Unsubscribed=true");
      });
    });

    it("sends false values for unchecked preferences", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = call[1].body;

        expect(body).toContain("unsubscribedtoAddedProtection=true");
        expect(body).toContain("unsubscribedtoHelpfulTips=false");
      });
    });

    it("disables button while submitting", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: jest.fn().mockResolvedValueOnce({
                    status: "OK",
                    result: "1",
                  }),
                }),
              100,
            ),
          ),
      );

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      expect(
        screen.getByRole("button", { name: /Processing…/i }),
      ).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Unsubscribe-Confirmation");
      });
    });

    it("redirects to confirmation page on success", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Unsubscribe-Confirmation");
      });
    });
  });

  describe("error handling", () => {
    it("displays API error message on submission failure", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: "Invalid email",
        }),
      });

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email/)).toBeInTheDocument();
      });
    });

    it("displays generic error on fetch failure", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const addedProtectionCheckbox = screen.getByRole("checkbox", {
        name: /Added Protection/i,
      });
      await user.click(addedProtectionCheckbox);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("email input has correct aria attributes", () => {
      render(<UnsubscribePreferencesPage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("error messages have role alert", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePreferencesPage />);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        const errorElements = screen.getAllByRole("alert");
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it("section has labelledby reference", () => {
      render(<UnsubscribePreferencesPage />);

      const section = screen.getByRole("region");
      expect(section).toHaveAttribute(
        "aria-labelledby",
        "unsubscribe-preferences-heading",
      );
    });
  });
});
