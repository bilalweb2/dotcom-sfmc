/**
 * @file __tests__/ftr-forms/api/WHWF_Processing.test.ts
 * @description Unit tests for POST /ftr-forms/api/WHWF_Processing
 * @jest-environment node
 */

// ── Mocks (must be before any imports that pull in the mocked modules) ──────
jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/WholeHomeWifi", () => ({
  WholeHomeWifiModel: {
    findOneAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "mock-id" }),
    }),
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
import { POST } from "@/app/api/WHWF_Processing/route";
import { WholeHomeWifiModel } from "@/models/WholeHomeWifi";
import { connectMongoose } from "@/libs/mongoose";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000/ftr-forms/api/WHWF_Processing";

function makeJsonRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const UPDATE_OPTIONS = {
  upsert: true,
  returnDocument: "after",
  runValidators: true,
} as const;

const VALID_PAYLOAD = {
  FirstName: "Jane",
  LastName: "Doe",
  EmailAddress: "jane.doe@example.com",
  Address: "123 Main St",
  City: "Dallas",
  State: "TX",
  PostalCode: "75201",
  GBLUID: "gbl-abc-123",
  BTN: "8005551234",
  submissionType: "whwf-form",
  PageName: "BAU WHWF - v1",
  Offer: "$0 for 1 month and then $10/mo.",
  ConfirmationCheckBox: 1,
};

/** Real-world Adobe Campaign parameters (from ?EMEID=...&CUHID=...&CMP=...&BID=... URL) */
const CAMPAIGN_PARAMS = {
  EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
  CUHID: "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
  CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
  BID: "628055001",
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /ftr-forms/api/WHWF_Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Success path ───────────────────────────────────────────────────────────
  describe("successful submission", () => {
    it('returns 200 with { status: "OK", result: "1" }', async () => {
      const response = await POST(makeJsonRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });

    it("connects to MongoDB for form persistence and audit logging", async () => {
      await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(connectMongoose).toHaveBeenCalledTimes(2);
    });

    it("persists all provided fields to WholeHomeWifiModel", async () => {
      await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        {
          $set: expect.objectContaining({
            FirstName: "Jane",
            LastName: "Doe",
            EmailAddress: "jane.doe@example.com",
            Address: "123 Main St",
            City: "Dallas",
            State: "TX",
            PostalCode: "75201",
            GBLUID: "gbl-abc-123",
            BTN: "8005551234",
            PageName: "BAU WHWF - v1",
            Offer: "$0 for 1 month and then $10/mo.",
            ConfirmationCheckBox: true,
          }),
          $unset: {
            BID: "",
            CMP: "",
            CUHID: "",
            EMEID: "",
          },
        },
        UPDATE_OPTIONS,
      );
    });

    it("applies default values for optional fields when omitted", async () => {
      await POST(
        makeJsonRequest({
          FirstName: "Jane",
          LastName: "Doe",
          EmailAddress: "min@example.com",
        }),
      );

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "abc123" },
        {
          $set: {
            ConfirmationCheckBox: false,
            EmailAddress: "min@example.com",
            FirstName: "Jane",
            GBLUID: "abc123",
            LastName: "Doe",
            Offer: "$0 for 1 month and then $10/mo.",
            PageName: "BAU WHWF - v1",
          },
          $unset: {
            Address: "",
            BID: "",
            BTN: "",
            CMP: "",
            CUHID: "",
            City: "",
            EMEID: "",
            PostalCode: "",
            State: "",
          },
        },
        UPDATE_OPTIONS,
      );
    });

    it("sanitises string fields — non-string values resolve to empty string", async () => {
      // sanitiseString guards with isNonEmptyString (typeof === 'string'), so non-string
      // JSON values (numbers, booleans) resolve to '' rather than a coerced string.
      await POST(
        makeJsonRequest({
          FirstName: 42 as unknown as string,
          LastName: true as unknown as string,
          EmailAddress: "test@x.com",
        }),
      );

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "abc123" },
        {
          $set: {
            ConfirmationCheckBox: false,
            EmailAddress: "test@x.com",
            GBLUID: "abc123",
            Offer: "$0 for 1 month and then $10/mo.",
            PageName: "BAU WHWF - v1",
          },
          $unset: {
            Address: "",
            BID: "",
            BTN: "",
            CMP: "",
            CUHID: "",
            City: "",
            EMEID: "",
            FirstName: "",
            LastName: "",
            PostalCode: "",
            State: "",
          },
        },
        UPDATE_OPTIONS,
      );
    });

    it("converts ConfirmationCheckBox to a Boolean", async () => {
      await POST(
        makeJsonRequest({ ...VALID_PAYLOAD, ConfirmationCheckBox: 0 }),
      );

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        expect.objectContaining({
          $set: expect.objectContaining({ ConfirmationCheckBox: false }),
        }),
        UPDATE_OPTIONS,
      );
    });
  });

  // ── Adobe Campaign click-tracking parameters ───────────────────────────────
  describe("Adobe Campaign parameters (EMEID / CUHID / CMP / BID)", () => {
    it("persists all four campaign params when provided in the payload", async () => {
      await POST(makeJsonRequest({ ...VALID_PAYLOAD, ...CAMPAIGN_PARAMS }));

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        {
          $set: expect.objectContaining({
            EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
            CUHID:
              "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
            CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
            BID: "628055001",
          }),
        },
        UPDATE_OPTIONS,
      );
    });

    it("unsets campaign params when omitted from the payload", async () => {
      await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        expect.objectContaining({
          $unset: {
            BID: "",
            CMP: "",
            CUHID: "",
            EMEID: "",
          },
        }),
        UPDATE_OPTIONS,
      );
    });

    it("returns 200 when campaign params are included", async () => {
      const response = await POST(
        makeJsonRequest({ ...VALID_PAYLOAD, ...CAMPAIGN_PARAMS }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });

    it("sanitises EMEID — unsets field when non-string value supplied", async () => {
      await POST(
        makeJsonRequest({
          ...VALID_PAYLOAD,
          EMEID: 12345 as unknown as string,
        }),
      );

      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        expect.objectContaining({
          $unset: expect.objectContaining({ EMEID: "" }),
        }),
        UPDATE_OPTIONS,
      );
    });
  });

  // ── Empty / minimal body ───────────────────────────────────────────────────
  describe("minimal / empty body", () => {
    it("returns 200 and persists blank identity fields", async () => {
      const response = await POST(
        makeJsonRequest({
          submissionType: "",
          FirstName: "",
          LastName: "",
          EmailAddress: "",
          Address: "",
          City: "",
          State: "",
          PostalCode: "",
          GBLUID: "",
          BTN: "",
          PageName: "BAU WHWF - v1",
          Offer: "$0 for 1 month and then $10/mo.",
          ConfirmationCheckBox: 1,
        }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
      expect(WholeHomeWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "abc123" },
        {
          $set: {
            ConfirmationCheckBox: true,
            GBLUID: "abc123",
            Offer: "$0 for 1 month and then $10/mo.",
            PageName: "BAU WHWF - v1",
          },
          $unset: {
            Address: "",
            BID: "",
            BTN: "",
            CMP: "",
            CUHID: "",
            City: "",
            EMEID: "",
            EmailAddress: "",
            FirstName: "",
            LastName: "",
            PostalCode: "",
            State: "",
          },
        },
        UPDATE_OPTIONS,
      );
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("returns 500 when WholeHomeWifiModel.findOneAndUpdate throws", async () => {
      (WholeHomeWifiModel.findOneAndUpdate as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error("DB write failed")),
      });

      const response = await POST(makeJsonRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Internal Server Error");
      expect(body.timestamp).toBeDefined();
    });

    it("returns 500 when connectMongoose throws", async () => {
      (connectMongoose as jest.Mock).mockRejectedValueOnce(
        new Error("Connection refused"),
      );

      const response = await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(response.status).toBe(500);
    });

    it("returns 500 when request body is not valid JSON", async () => {
      const badRequest = new NextRequest(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json{{{",
      });

      const response = await POST(badRequest);

      expect(response.status).toBe(500);
    });
  });
});
