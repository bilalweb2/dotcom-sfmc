/**
 * @file __tests__/components/UnsubscribePage.test.tsx
 * @description Unit tests for UnsubscribePage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { UnsubscribePage } from "@/components/UnsubscribePage";

// ── Mocks ─────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

global.fetch = jest.fn();

// ── Tests ─────────────────────────────────────────────────────────────────
describe("UnsubscribePage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the page heading", () => {
      render(<UnsubscribePage />);

      expect(
        screen.getByRole("heading", { name: /We're sorry to see you go/i }),
      ).toBeInTheDocument();
    });

    it("renders the subtext", () => {
      render(<UnsubscribePage />);

      expect(
        screen.getByText(/Please enter your email address/i),
      ).toBeInTheDocument();
    });

    it("renders the email input field", () => {
      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
    });

    it("renders the unsubscribe button", () => {
      render(<UnsubscribePage />);

      expect(
        screen.getByRole("button", { name: /UNSUBSCRIBE/i }),
      ).toBeInTheDocument();
    });

    it("button is enabled initially", () => {
      render(<UnsubscribePage />);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe("form validation", () => {
    it("displays error when email is empty", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePage />);

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
      render(<UnsubscribePage />);

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

    it("does not display error for valid email", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Unsubscribe-Confirmation");
      });
    });
  });

  describe("form submission", () => {
    it("submits form with valid email", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/ftr-forms/api/UnsubFormProcessing",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }),
        );
      });
    });

    it("sends correct request body with email", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ status: "OK", result: "1" }),
      });

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = call[1].body;
        expect(body).toContain("EmailAddress=test%40example.com");
        expect(body).toContain("submissionType=");
      });
    });

    it("disables button and shows loading state while submitting", async () => {
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

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      // Button should show loading state and be disabled
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

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/Unsubscribe-Confirmation");
      });
    });
  });

  describe("error handling", () => {
    it("displays error message when API returns error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: "Email not found",
        }),
      });

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Email not found/)).toBeInTheDocument();
      });
    });

    it("displays generic error when API returns unknown error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Unsubscribe request failed/i),
        ).toBeInTheDocument();
      });
    });

    it("displays generic error when fetch throws", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("displays generic message when error is not an Error object", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce("string error");

      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      await user.type(emailInput, "test@example.com");

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("email input has correct aria attributes", () => {
      render(<UnsubscribePage />);

      const emailInput = screen.getByRole("textbox", {
        name: /Email Address/i,
      });
      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("error message has role alert", async () => {
      const user = userEvent.setup();
      render(<UnsubscribePage />);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      await user.click(button);

      await waitFor(() => {
        const errorElement = screen.getByText(/Email address is required/i);
        expect(errorElement).toHaveAttribute("role", "alert");
      });
    });

    it("button has correct aria-disabled attribute", () => {
      render(<UnsubscribePage />);

      const button = screen.getByRole("button", { name: /UNSUBSCRIBE/i });
      expect(button).toHaveAttribute("aria-disabled", "false");
    });

    it("section has labelledby reference", () => {
      render(<UnsubscribePage />);

      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-labelledby", "unsubscribe-heading");
    });
  });
});
