/**
 * @file __tests__/api/disconnecting-processing.test.ts
 * @description Unit tests for POST /ftr-forms/api/disconnecting-processing
 * @jest-environment node
 */

jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/PendingDisco", () => ({
  PendingDiscoModel: {
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

import { NextRequest } from "next/server";
import { POST } from "@/app/api/disconnecting-processing/route";
import { PendingDiscoModel } from "@/models/PendingDisco";
import { connectMongoose } from "@/libs/mongoose";

const BASE_URL = "http://localhost:3000/ftr-forms/api/disconnecting-processing";

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
  submissionType: "pending-disco",
  PageName: "Save from disconnecting",
  Offer: "2/mo free 500 HSI,then $19/mo",
  ConfirmationCheckBox: 1,
};

const CAMPAIGN_PARAMS = {
  EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
  CUHID: "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
  CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
  BID: "628055001",
};

describe("POST /ftr-forms/api/disconnecting-processing", () => {
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

    it("persists all provided fields to PendingDiscoModel", async () => {
      await POST(makeJsonRequest(VALID_PAYLOAD));

      expect(PendingDiscoModel.findOneAndUpdate).toHaveBeenCalledWith(
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
            PageName: "Save from disconnecting",
            Offer: "2/mo free 500 HSI,then $19/mo",
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

      expect(PendingDiscoModel.findOneAndUpdate).toHaveBeenCalledWith(
        { GBLUID: "abc123" },
        {
          $set: {
            ConfirmationCheckBox: false,
            EmailAddress: "min@example.com",
            FirstName: "Jane",
            GBLUID: "abc123",
            LastName: "Doe",
            Offer: "2/mo free 500 HSI,then $19/mo",
            PageName: "Save from disconnecting",
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
            submissionType: "",
          },
        },
        UPDATE_OPTIONS,
      );
    });

    it("converts ConfirmationCheckBox to a Boolean", async () => {
      await POST(
        makeJsonRequest({ ...VALID_PAYLOAD, ConfirmationCheckBox: 0 }),
      );

      expect(PendingDiscoModel.findOneAndUpdate).toHaveBeenCalledWith(
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

      expect(PendingDiscoModel.findOneAndUpdate).toHaveBeenCalledWith(
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

      expect(PendingDiscoModel.findOneAndUpdate).toHaveBeenCalledWith(
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
  });

  describe("error handling", () => {
    it("returns 500 when PendingDiscoModel.findOneAndUpdate throws", async () => {
      (PendingDiscoModel.findOneAndUpdate as jest.Mock).mockReturnValueOnce({
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
