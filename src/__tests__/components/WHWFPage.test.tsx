/**
 * @file __tests__/components/WHWFPage.test.tsx
 * @description Unit tests for WHWFPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { WHWFPage } from "@/components/WHWFPage";

// ── Mocks ─────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} />
  ),
}));

global.fetch = jest.fn();

// ── Tests ─────────────────────────────────────────────────────────────────
describe("WHWFPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the hero heading", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(
        screen.getByRole("heading", { name: /Upgrade/i }),
      ).toBeInTheDocument();
    });

    it("renders the hero subheading", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const elements = screen.getAllByText(/your wi-fi/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("renders the offer section heading", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(screen.getByText(/\$0 for the first month/i)).toBeInTheDocument();
    });

    it("renders the price details", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      // Check for price text pattern
      const elements = screen.getAllByText(/\$10/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("renders the Whole-Home Wi-Fi features", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(screen.getByText(/Up to two eero devices/i)).toBeInTheDocument();
      expect(screen.getByText(/installation kit is sent/i)).toBeInTheDocument();
    });

    it("renders the consent checkbox", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("renders the consent text", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(
        screen.getByText(/confirming that I'm at least 18 years old/i),
      ).toBeInTheDocument();
    });

    it("renders the submit button", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(
        screen.getByRole("button", { name: /Place my order/i }),
      ).toBeInTheDocument();
    });

    it("renders the legal footer text", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      expect(
        screen.getByText(/After the promotional period/i),
      ).toBeInTheDocument();
    });

    it("renders hero image", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const heroImages = screen.getAllByAltText("");
      expect(heroImages.length).toBeGreaterThan(0);
      // Hero image should be the first one with src /images/whwf-hero.jpg
      const heroImage = heroImages.find((img) =>
        img.getAttribute("src")?.includes("whwf-hero"),
      );
      expect(heroImage).toBeDefined();
    });

    it("renders checkmark icons for features", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const allImages = screen.getAllByAltText("");
      // Should have at least hero image + checkmark images
      expect(allImages.length).toBeGreaterThan(1);
    });

    it("renders frontier.com link in footer", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const link = screen.getByTitle("www.frontier.com/whwf");
      expect(link).toHaveAttribute("href", "https://www.frontier.com/whwf");
    });
  });

  describe("button state management", () => {
    it("submit button is disabled initially", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("submit button is disabled when consent is not checked", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).toBeDisabled();
    });

    it("submit button becomes enabled when consent checkbox is checked", async () => {
      const user = userEvent.setup();
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "false");
    });

    it("submit button becomes disabled again when consent is unchecked", async () => {
      const user = userEvent.setup();
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });

      await user.click(checkbox);
      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).not.toBeDisabled();

      await user.click(checkbox);
      expect(button).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("submits when consent is checked", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/ftr-forms/api/WHWF_Processing",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });
    });

    it("sends correct request body with pageName", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<WHWFPage pageName="Test Page Name" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(call[1].body);

        expect(body.PageName).toBe("Test Page Name");
        expect(body.Offer).toBe("$0 for 1 month and then $10/mo.");
        expect(body.ConfirmationCheckBox).toBe(true);
      });
    });

    it("shows loading state while submitting", async () => {
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

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      expect(
        screen.getByRole("button", { name: /Submitting…/i }),
      ).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/WHWF-Confirmation");
      });
    });

    it("redirects to confirmation page on success", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/WHWF-Confirmation");
      });
    });

    it("does not submit when consent is not checked", async () => {
      const user = userEvent.setup();
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).toBeDisabled();

      // Try to click disabled button (should not work)
      await user.click(button);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("displays error when API returns non-OK status", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: "Server error",
        }),
      });

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });
    });

    it("displays generic error when API returns unknown error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Submission failed/)).toBeInTheDocument();
      });
    });

    it("displays error when response status is not OK with result 1", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "ERROR",
          result: "0",
        }),
      });

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Unexpected response from server/),
        ).toBeInTheDocument();
      });
    });

    it("displays error when fetch throws", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("displays generic message when error is not an Error object", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce("string error");

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });

    it("error message has role alert", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        const errorElement = screen.getByText(/Test error/);
        expect(errorElement).toHaveAttribute("role", "alert");
      });
    });
  });

  describe("props", () => {
    it("accepts pageName prop", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<WHWFPage pageName="Custom Page" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.PageName).toBe("Custom Page");
      });
    });

    it("updates PageName when prop changes", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      const { rerender } = render(<WHWFPage pageName="Initial Page Name" />);

      rerender(<WHWFPage pageName="Updated Page Name" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.PageName).toBe("Updated Page Name");
      });
    });
  });

  describe("accessibility", () => {
    it("consent checkbox has correct aria label", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      expect(checkbox).toBeInTheDocument();
    });

    it("button has correct aria-disabled attribute", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const button = screen.getByRole("button", { name: /Place my order/i });
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("hero section has labelledby reference", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const heroSection = screen.getByRole("region", {
        name: /^(?!Offer details)/,
      });
      expect(heroSection).toHaveAttribute("aria-labelledby", "hero-heading");
    });

    it("offer section has label", () => {
      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const sections = screen.getAllByRole("region");
      const offerSection = sections.find((section) =>
        section.getAttribute("aria-label")?.includes("Offer details"),
      );
      expect(offerSection).toHaveAttribute("aria-label", "Offer details");
    });

    it("error message has role alert", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Test error"),
      );

      render(<WHWFPage pageName="BAU WHWF - v1" />);

      const checkbox = screen.getByRole("checkbox", {
        name: /I agree to the terms and conditions/i,
      });
      await user.click(checkbox);

      const button = screen.getByRole("button", { name: /Place my order/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Test error/)).toHaveAttribute("role", "alert");
      });
    });
  });
});
