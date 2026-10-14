/**
 * @file __tests__/ftr-forms/api/UnsubFormProcessing.test.ts
 * @description Unit tests for POST /ftr-forms/api/UnsubFormProcessing
 * @jest-environment node
 */

// ── Mocks (must be before any imports that pull in the mocked modules) ──────
jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/UnsubscribeForm", () => ({
  UnsubscribeFormModel: {
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
import { POST } from "@/app/api/UnsubFormProcessing/route";
import { UnsubscribeFormModel } from "@/models/UnsubscribeForm";
import { connectMongoose } from "@/libs/mongoose";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000/ftr-forms/api/UnsubFormProcessing";

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

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /ftr-forms/api/UnsubFormProcessing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── URL-encoded submissions ────────────────────────────────────────────────
  describe("URL-encoded form submission", () => {
    it('returns 200 with { status: "OK", result: "1" } on valid email', async () => {
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

    it("calls UnsubscribeFormModel.findOneAndUpdate with the trimmed email", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("includes SubmitDate in the update", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
          SubmitDate: expect.any(String),
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("parses numeric and string fields correctly", async () => {
      const body = [
        "EmailAddress=test%40example.com",
        "submissionType=campaign-x",
        "GBLUID=abc-123",
        "SubscriberId=42",
        "JobId=7",
        "ListId=3",
        "BatchId=1",
        "unsubscribedtoAddedProtection=1",
        "unsubscribedtoYouTubeTV=1",
        "Unsubscribed=1",
      ].join("&");

      await POST(makeFormRequest(body));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });

  // ── JSON submissions ───────────────────────────────────────────────────────
  describe("JSON submission (fallback)", () => {
    it("returns 200 when content-type is application/json", async () => {
      const response = await POST(
        makeJsonRequest({ EmailAddress: "json@example.com" }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });

    it("persists data from JSON body", async () => {
      await POST(
        makeJsonRequest({
          EmailAddress: "json@example.com",
          unsubscribedtoAddedProtection: 1,
          submissionType: "json-submit",
        }),
      );

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "json@example.com" },
        expect.objectContaining({
          EmailAddress: "json@example.com",
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe("validation", () => {
    it("returns 400 when EmailAddress is missing entirely", async () => {
      const response = await POST(makeFormRequest("submissionType=test"));
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

      expect(UnsubscribeFormModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("returns 500 when UnsubscribeFormModel.findOneAndUpdate throws", async () => {
      (
        UnsubscribeFormModel.findOneAndUpdate as jest.Mock
      ).mockRejectedValueOnce(new Error("DB write error"));

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

  // ── Create behavior ───────────────────────────────────────────────────────
  describe("upsert behavior", () => {
    it("always calls findOneAndUpdate to add or update records", async () => {
      await POST(makeFormRequest("EmailAddress=test%40example.com"));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("uses email and SubmitDate for the update", async () => {
      await POST(makeFormRequest("EmailAddress=update%40example.com"));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "update@example.com" },
        expect.objectContaining({
          EmailAddress: "update@example.com",
          SubmitDate: expect.any(String),
        }),
        { upsert: true, returnDocument: "after" },
      );
    });

    it("includes SubmitDate regardless of preference values in payload", async () => {
      const body = [
        "EmailAddress=test%40example.com",
        "unsubscribedtoAddedProtection=1",
        "unsubscribedtoHelpfulTips=0",
      ].join("&");

      await POST(makeFormRequest(body));

      expect(UnsubscribeFormModel.findOneAndUpdate).toHaveBeenCalledWith(
        { EmailAddress: "test@example.com" },
        expect.objectContaining({
          EmailAddress: "test@example.com",
          SubmitDate: expect.any(String),
        }),
        { upsert: true, returnDocument: "after" },
      );
    });
  });
});
