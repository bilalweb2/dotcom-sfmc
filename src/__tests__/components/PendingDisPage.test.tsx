/**
 * @file __tests__/components/PendingDisPage.test.tsx
 * @description Unit tests for PendingDisPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { PendingDisPage } from "@/components/PendingDisPage";

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

describe("PendingDisPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (global.fetch as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders the hero heading", () => {
      render(<PendingDisPage pageName="Save from disconnecting" />);

      expect(
        screen.getByRole("heading", { name: /GIVE US ONE MORE CHANCE/i }),
      ).toBeInTheDocument();
    });

    it("renders the consent checkbox and submit button", () => {
      render(<PendingDisPage pageName="Save from disconnecting" />);

      expect(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ACCEPT OFFER NOW/i }),
      ).toBeInTheDocument();
    });

    it("submit button is disabled until consent is checked", async () => {
      const user = userEvent.setup();
      render(<PendingDisPage pageName="Save from disconnecting" />);

      const button = screen.getByRole("button", { name: /ACCEPT OFFER NOW/i });
      expect(button).toBeDisabled();

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );

      expect(button).not.toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("POSTs to disconnecting-processing with pageName and campaign params", async () => {
      const user = userEvent.setup();
      (useSearchParams as jest.Mock).mockReturnValue(
        new URLSearchParams(
          "EMEID=emeid-val&CUHID=cuhid-val&CMP=cmp-val&BID=bid-val",
        ),
      );
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<PendingDisPage pageName="Custom pending page" />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(
        screen.getByRole("button", { name: /ACCEPT OFFER NOW/i }),
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/ftr-forms/api/disconnecting-processing",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });

      const call = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body) as Record<string, unknown>;

      expect(body.PageName).toBe("Custom pending page");
      expect(body.Offer).toBe("2/mo free 500 HSI,then $19/mo");
      expect(body.ConfirmationCheckBox).toBe(true);
      expect(body.EMEID).toBe("emeid-val");
      expect(body.CUHID).toBe("cuhid-val");
      expect(body.CMP).toBe("cmp-val");
      expect(body.BID).toBe("bid-val");
    });

    it("redirects to confirmation on success", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          status: "OK",
          result: "1",
        }),
      });

      render(<PendingDisPage pageName="Save from disconnecting" />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(
        screen.getByRole("button", { name: /ACCEPT OFFER NOW/i }),
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/pendingdeactivationsavedconfirmation",
        );
      });
    });

    it("does not submit when consent is not checked", async () => {
      const user = userEvent.setup();
      render(<PendingDisPage pageName="Save from disconnecting" />);

      const button = screen.getByRole("button", { name: /ACCEPT OFFER NOW/i });
      await user.click(button);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("displays API error message when response is not ok", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: "Server error" }),
      });

      render(<PendingDisPage pageName="Save from disconnecting" />);

      await user.click(
        screen.getByRole("checkbox", {
          name: /I agree to the terms and conditions/i,
        }),
      );
      await user.click(
        screen.getByRole("button", { name: /ACCEPT OFFER NOW/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });
    });
  });
});
