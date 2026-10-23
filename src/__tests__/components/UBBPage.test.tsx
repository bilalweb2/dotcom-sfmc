/**
 * @file __tests__/components/UBBPage.test.tsx
 * @description Unit tests for UBBPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { UBBPage } from "@/components/UBBPage";
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

describe("UBBPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the hero heading about internet outages", () => {
      render(<UBBPage pageName="UBB-Connected Living" />);

      expect(
        screen.getByRole("heading", { name: /internet outages/i }),
      ).toBeInTheDocument();
    });

    it("renders the Unbreakable Wi-Fi offer and price", () => {
      render(<UBBPage pageName="UBB-Connected Living" />);

      expect(screen.getByText(/\$25\/mo/i)).toBeInTheDocument();
    });

    it("renders the consent checkbox and submit button", () => {
      render(<UBBPage pageName="UBB-Connected Living" />);

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

      render(<UBBPage pageName="UBB-Connected Living" />);

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

      render(<UBBPage pageName="UBB-Connected Living" />);

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

    it("sends PageName and UBB offer in the request body", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<UBBPage pageName="UBB-Connected Living" />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(screen.getByRole("button", { name: /Place my order/i }));

      await waitFor(() => {
        const call = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(call[1].body) as Record<string, unknown>;

        expect(body.PageName).toBe("UBB-Connected Living");
        expect(body.Offer).toBe("Unbreakable $25/mo");
        expect(body.ConfirmationCheckBox).toBe(true);
      });
    });
  });
});
