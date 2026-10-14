/**
 * @file __tests__/ftr-forms/api/Unsubscribe-Form-Processing.test.ts
 * @description Unit tests for POST /ftr-forms/api/Unsubscribe-Form-Processing
 * @jest-environment node
 */

// ── Mocks (must be before any imports that pull in the mocked modules) ──────
jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/Unsubscribe", () => ({
  UnsubscribeModel: {
    findOneAndUpdate: jest.fn().mockResolvedValue({ _id: "mock-id" }),
  },
}));

jest.mock("@/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  maskEmail: jest.fn(
    (email: string) => `m***@${email?.split("@")[1] ?? "example.com"}`,
  ),
  maskPhone: jest.fn(() => "***-***-0000"),
}));

// ── Imports ──────────────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { POST } from "@/app/api/Unsubscribe-Form-Processing/route";
import { UnsubscribeModel } from "@/models/Unsubscribe";
import { connectMongoose } from "@/libs/mongoose";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE_URL =
  "http://localhost:3000/ftr-forms/api/Unsubscribe-Form-Processing";

function makeFormRequest(body: string): NextRequest {
  return new NextRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

function makeJsonRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Full-unsubscribe preferences payload (all flags = 1) ──────────────────
const FULL_PREFS_BODY = [
  "EmailAddress=prefs%40example.com",
  "unsubscribedtoAddedProtection=1",
  "unsubscribedtoHelpfulTips=1",
  "unsubscribedtoInternetUpgrades=1",
  "unsubscribedtoNewProducts=1",
  "subscribedtoNewsletters=1",
  "unsubscribedtoReferaFriend=1",
  "unsubscribedtoRewards=1",
  "unsubscribedtoSpecialOffers=1",
  "unsubscribedtoWiFiEnhancements=1",
  "unsubscribedtoYouTubeTV=1",
  "Unsubscribed=1",
].join("&");

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /ftr-forms/api/Unsubscribe-Form-Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Success path ───────────────────────────────────────────────────────────
  describe("successful submission", () => {
    it('returns 200 with { status: "OK", result: "1" }', async () => {
      const response = await POST(
        makeFormRequest("EmailAddress=test%40example.com"),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });

    it("connects to MongoDB for form persistence and audit logging", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(connectMongoose).toHaveBeenCalledTimes(2);
    });

    it("calls UnsubscribeModel.findOneAndUpdate with the trimmed email", async () => {
      await POST(makeFormRequest("EmailAddress=prefs%40example.com"));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "prefs@example.com" },
        expect.objectContaining({
          EmailAddress: "prefs@example.com",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("persists all-unsubscribed preferences payload (flags all = 1)", async () => {
      await POST(makeFormRequest(FULL_PREFS_BODY));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "prefs@example.com" },
        expect.objectContaining({
          EmailAddress: "prefs@example.com",
          GBLUID: "",
          unsubscribedtoAddedProtection: "1",
          unsubscribedtoHelpfulTips: "1",
          unsubscribedtoInternetUpgrades: "1",
          unsubscribedtoNewProducts: "1",
          unsubscribedtoNewsletters: null,
          unsubscribedtoReferaFriend: "1",
          unsubscribedtoRewards: "1",
          unsubscribedtoSpecialOffers: "1",
          unsubscribedtoWiFiEnhancements: "1",
          unsubscribedtoYouTubeTV: "1",
          Unsubscribed: "1",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("defaults missing preference fields to null", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
          unsubscribedtoAddedProtection: null,
          unsubscribedtoHelpfulTips: null,
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("persists SFMC fields from params (stored as strings)", async () => {
      const body = [
        "EmailAddress=test%40example.com",
        "SubscriberId=99",
        "JobId=12",
        "ListId=5",
        "BatchId=2",
      ].join("&");

      await POST(makeFormRequest(body));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });

  // ── JSON fallback ──────────────────────────────────────────────────────────
  describe("JSON submission (fallback)", () => {
    it("returns 200 when content-type is application/json", async () => {
      const response = await POST(
        makeJsonRequest({ EmailAddress: "json@example.com" }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });

    it("persists unsubscribe preferences from JSON body", async () => {
      await POST(
        makeJsonRequest({
          EmailAddress: "json@example.com",
          unsubscribedtoAddedProtection: 1,
          Unsubscribed: 1,
        }),
      );

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "json@example.com" },
        expect.objectContaining({
          EmailAddress: "json@example.com",
          unsubscribedtoAddedProtection: "1",
          Unsubscribed: "1",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe("validation", () => {
    it("returns 400 when EmailAddress is absent", async () => {
      const response = await POST(
        makeFormRequest("unsubscribedtoAddedProtection=1"),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Validation failed");
      expect(body.details).toContain("EmailAddress is required");
      expect(body.timestamp).toBeDefined();
    });

    it("returns 400 when EmailAddress is whitespace only", async () => {
      const response = await POST(makeFormRequest("EmailAddress=+++"));
      expect(response.status).toBe(400);
    });

    it("does not persist form data when validation fails", async () => {
      await POST(makeFormRequest(""));

      expect(UnsubscribeModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("returns 500 when UnsubscribeModel.findOneAndUpdate throws", async () => {
      (UnsubscribeModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(
        new Error("Write failed"),
      );

      const response = await POST(
        makeFormRequest("EmailAddress=test%40example.com"),
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal Server Error");
      expect(body.timestamp).toBeDefined();
    });

    it("returns 500 when connectMongoose throws", async () => {
      (connectMongoose as jest.Mock).mockRejectedValueOnce(
        new Error("Connection refused"),
      );

      const response = await POST(
        makeFormRequest("EmailAddress=test%40example.com"),
      );

      expect(response.status).toBe(500);
    });
  });

  // ── Upsert behavior ────────────────────────────────────────────────────────
  describe("upsert behavior", () => {
    it("calls findOneAndUpdate with upsert: true, returnDocument: after", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("uses email as filter for update", async () => {
      await POST(makeFormRequest("EmailAddress=update%40example.com"));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "update@example.com" },
        expect.any(Object),
        expect.any(Object),
      );
    });

    it("replaces all preferences with new values", async () => {
      const body = [
        "EmailAddress=test%40example.com",
        "unsubscribedtoAddedProtection=1",
        "unsubscribedtoHelpfulTips=0",
      ].join("&");

      await POST(makeFormRequest(body));

      expect(UnsubscribeModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
          unsubscribedtoAddedProtection: "1",
          unsubscribedtoHelpfulTips: "0",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });
});
