import { fetchDecodedEmail, postForm } from "@/utils/fetch";

describe("common fetch helpers", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe("fetchDecodedEmail", () => {
    it("requests the decoded email with tracking parameters and an abort signal", async () => {
      const controller = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          data: { decoded: "test@example.com" },
        }),
      });

      await expect(
        fetchDecodedEmail("encoded+id", "customer id", controller.signal),
      ).resolves.toBe("test@example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "/ftr-forms/api/DecodeEMEID?EMEID=encoded%2Bid&CUHID=customer+id",
        { signal: controller.signal },
      );
    });

    it("returns undefined when the API rejects the decode request", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(fetchDecodedEmail("encoded-id")).resolves.toBeUndefined();
    });
  });

  describe("postForm", () => {
    it("posts url-encoded form data", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const body = new URLSearchParams({ EmailAddress: "test@example.com" });

      await expect(postForm("/api/submit", body)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "EmailAddress=test%40example.com",
      });
    });

    it("throws the API error message when the request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: "Invalid email" }),
      });

      await expect(
        postForm("/api/submit", new URLSearchParams()),
      ).rejects.toThrow("Invalid email");
    });

    it("uses a fallback error when the API response has no message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await expect(
        postForm("/api/submit", new URLSearchParams()),
      ).rejects.toThrow("Unsubscribe request failed");
    });
  });
});
