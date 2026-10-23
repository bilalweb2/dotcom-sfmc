/**
 * @file __tests__/api/unbreakable-wifi-confirmation.test.ts
 * @description Unit tests for POST /ftr-forms/api/unbreakable-wifi-confirmation
 * @jest-environment node
 */

jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/UBBWifi", () => ({
  UBBWifiModel: {
    findOneAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "mock-id" }),
    }),
  },
}));

jest.mock("@/models/AuditLog", () => ({
  AuditLogModel: {
    create: jest.fn().mockResolvedValue({ _id: "mock-audit-id" }),
  },
}));

jest.mock("@/libs/azureInsights", () => ({
  getAzureInsightsClient: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/libs/newRelic", () => ({
  getNewRelicAgent: jest.fn().mockResolvedValue(null),
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

import { NextRequest } from "next/server";
import { POST } from "@/app/api/unbreakable-wifi-confirmation/route";
import { UBBWifiModel } from "@/models/UBBWifi";
import { connectMongoose } from "@/libs/mongoose";

const BASE_URL =
  "http://localhost:3000/ftr-forms/api/unbreakable-wifi-confirmation";

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
  PageName: "UBB-Connected Living",
  Offer: "Unbreakable $25/mo",
  ConfirmationCheckBox: 1,
};

const CAMPAIGN_PARAMS = {
  EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
  CUHID: "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
  CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
  BID: "628055001",
};

describe("POST /ftr-forms/api/unbreakable-wifi-confirmation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    it("persists all provided fields to UBBWifiModel", async () => {
      await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(UBBWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
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
            PageName: "UBB-Connected Living",
            Offer: "Unbreakable $25/mo",
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

      expect(UBBWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
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

    it("converts ConfirmationCheckBox to a Boolean", async () => {
      await POST(
        makeJsonRequest({ ...VALID_PAYLOAD, ConfirmationCheckBox: 0 }),
      );

      expect(UBBWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "gbl-abc-123" },
        expect.objectContaining({
          $set: expect.objectContaining({ ConfirmationCheckBox: false }),
        }),
        UPDATE_OPTIONS,
      );
    });
  });

  describe("Adobe Campaign parameters (EMEID / CUHID / CMP / BID)", () => {
    it("persists all four campaign params when provided in the payload", async () => {
      await POST(makeJsonRequest({ ...VALID_PAYLOAD, ...CAMPAIGN_PARAMS }));

      expect(UBBWifiModel.findOneAndUpdate).toHaveBeenCalledWith(
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

    it("returns 200 when campaign params are included", async () => {
      const response = await POST(
        makeJsonRequest({ ...VALID_PAYLOAD, ...CAMPAIGN_PARAMS }),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "OK", result: "1" });
    });
  });

  describe("error handling", () => {
    it("returns 500 when UBBWifiModel.findOneAndUpdate throws", async () => {
      (UBBWifiModel.findOneAndUpdate as jest.Mock).mockReturnValueOnce({
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

    it("returns 503 when MongoDB server selection times out", async () => {
      const timeoutError = new Error("Server selection timed out");
      timeoutError.name = "MongooseServerSelectionError";
      (connectMongoose as jest.Mock).mockRejectedValueOnce(timeoutError);

      const response = await POST(makeJsonRequest(VALID_PAYLOAD));
      const body = await response.json();

      expect(response.status).toBe(503);
      expect(body.error).toBe("Database temporarily unavailable");
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
