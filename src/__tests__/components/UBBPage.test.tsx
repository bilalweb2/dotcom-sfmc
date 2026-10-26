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
  const defaultProps = {
    pageName: "UBB-Connected Living",
    Offer: "Unbreakable $25/mo",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the hero heading about internet outages", () => {
      render(<UBBPage {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: /internet outages/i }),
      ).toBeInTheDocument();
    });

    it("renders the Unbreakable Wi-Fi offer and price", () => {
      render(<UBBPage {...defaultProps} showPrice />);

      expect(screen.getByText(/\$25\/mo/i)).toBeInTheDocument();
    });

    it("renders the consent checkbox and submit button", () => {
      render(<UBBPage {...defaultProps} />);

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

      render(<UBBPage {...defaultProps} />);

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

      render(<UBBPage {...defaultProps} />);

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

    it.each([
      {
        label: "UBB-BAU",
        props: {
          pageName: "UBB-Connected Living",
          Offer: "Unbreakable $25/mo",
        },
      },
      {
        label: "UBBv1",
        props: {
          pageName: "UBB-V1",
          Offer: "Unbreakable - 1 mon free then $25/mo",
        },
      },
    ])(
      "sends PageName and offer for $label to the UBB processing API",
      async ({ props }) => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce({
            status: "OK",
            result: "1",
          }),
        });

        render(<UBBPage {...props} />);

        await user.click(
          screen.getByRole("checkbox", {
            name: /I agree to the terms and conditions/i,
          }),
        );
        await user.click(
          screen.getByRole("button", { name: /Place my order/i }),
        );

        await waitFor(() => {
          const call = (global.fetch as jest.Mock).mock.calls[0];
          const body = JSON.parse(call[1].body) as Record<string, unknown>;

          expect(global.fetch).toHaveBeenCalledWith(
            API_ROUTES.UBB_PROCESSING,
            expect.any(Object),
          );
          expect(body.PageName).toBe(props.pageName);
          expect(body.Offer).toBe(props.Offer);
          expect(body.ConfirmationCheckBox).toBe(true);
        });
      },
    );

    it("renders UBBv1 promotional copy when offerPrice is enabled", () => {
      render(
        <UBBPage
          pageName="UBB-V1"
          Offer="Unbreakable - 1 mon free then $25/mo"
          offerPrice
        />,
      );

      expect(
        screen.getByText(/pay \$0 for the first month/i),
      ).toBeInTheDocument();
    });
  });
});
