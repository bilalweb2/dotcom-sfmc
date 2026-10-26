/**
 * @file __tests__/components/UBBv2Page.test.tsx
 * @description Unit tests for UBBv2Page component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { UBBv2Page } from "@/components/UBBv2Page";
import { API_ROUTES } from "@/constants";

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

describe("UBBv2Page", () => {
  const mockPush = jest.fn();
  const defaultProps = {
    pageName: "UBB-V3",
    Offer: "WHWF $10/mo and Unbreakable $25/mo",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the upgrade hero heading", () => {
      render(<UBBv2Page {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: /upgrade your wi-fi/i }),
      ).toBeInTheDocument();
    });

    it("renders Unbreakable and Whole-Home Wi-Fi feature sections", () => {
      render(<UBBv2Page {...defaultProps} />);

      expect(
        screen.getByText(/Automatically switches your internet connection/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Whole-Home Wi-Fi:")).toBeInTheDocument();
    });

    it("renders the consent checkbox and submit button", () => {
      render(<UBBv2Page {...defaultProps} />);

      expect(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Place my order/i }),
      ).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("posts to the UBB processing API when consent is checked", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<UBBv2Page {...defaultProps} />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(screen.getByRole("button", { name: /Place my order/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          API_ROUTES.UBB_PROCESSING,
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });
    });

    it("redirects to the Unbreakable Wi-Fi confirmation page on success", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<UBBv2Page {...defaultProps} />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(screen.getByRole("button", { name: /Place my order/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/unbreakable-wifi-confirmation");
      });
    });

    it("sends PageName and offer in the request body", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<UBBv2Page {...defaultProps} />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(screen.getByRole("button", { name: /Place my order/i }));

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(call[1].body) as Record<string, unknown>;

        expect(body.PageName).toBe("UBB-V3");
        expect(body.Offer).toBe("WHWF $10/mo and Unbreakable $25/mo");
        expect(body.ConfirmationCheckBox).toBe(true);
      });
    });
  });
});
