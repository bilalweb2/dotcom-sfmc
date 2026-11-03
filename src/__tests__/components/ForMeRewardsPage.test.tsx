/**
 * @file __tests__/components/ForMeRewardsPage.test.tsx
 * @description Unit tests for ForMeRewardsPage component
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { ForMeRewardsPage } from "@/components/ForMeRewardsPage";

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

describe("ForMeRewardsPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders the hero heading", () => {
    render(<ForMeRewardsPage />);

    expect(
      screen.getByRole("heading", { name: /For Me Rewards/i }),
    ).toBeInTheDocument();
  });

  it("sends ForMeRewards as PageName on submit", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status: "OK",
        result: "1",
      }),
    });

    render(<ForMeRewardsPage />);

    const checkbox = screen.getByRole("checkbox", {
      name: /I agree to the terms and conditions/i,
    });
    await user.click(checkbox);

    const button = screen.getByRole("button", { name: /Place my order/i });
    await user.click(button);

    await waitFor(() => {
      const call = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);

      expect(body.PageName).toBe("ForMeRewards");
      expect(body.ConfirmationCheckBox).toBe(true);
    });
  });
});
