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
    create: jest.fn().mockResolvedValue({ _id: "mock-id" }),
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

const VALID_PAYLOAD = {
  FirstName: "Jane",
  LastName: "Doe",
  EmailAddress: "jane.doe@example.com",
  Address: "123 Main St",
  City: "Dallas",
  State: "TX",
  PostalCode: "75201",
  BTN: "8005551234",
  PageName: "UBB-Connected Living",
  Offer: "Unbreakable $25/mo",
  ConfirmationCheckBox: 1,
};

const CAMPAIGN_PARAMS = {
  EMHID: "881b88812e0c7e2354153d8a7f967651",
  EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
  CUHID: "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
  CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
  BID: "628055001",
};
const createMock = UBBWifiModel.create as jest.Mock;

describe("POST /ftr-forms/api/unbreakable-wifi-confirmation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with { status: "OK", result: "1" }', async () => {
    const response = await POST(makeJsonRequest(VALID_PAYLOAD));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "OK", result: "1" });
  });

  it("creates a new document for every submission and excludes GBLUID", async () => {
    await POST(makeJsonRequest({ ...VALID_PAYLOAD, GBLUID: "legacy-id" }));
    await POST(makeJsonRequest({ ...VALID_PAYLOAD, GBLUID: "legacy-id" }));

    expect(createMock).toHaveBeenCalledTimes(2);
    expect(createMock.mock.calls[0]?.[0]).not.toHaveProperty("GBLUID");
  });

  it("stores all campaign parameters separately when present", async () => {
    await POST(makeJsonRequest({ ...VALID_PAYLOAD, ...CAMPAIGN_PARAMS }));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining(CAMPAIGN_PARAMS),
    );
  });

  it("leaves absent campaign parameters unset", async () => {
    await POST(makeJsonRequest(VALID_PAYLOAD));

    const document = createMock.mock.calls[0]?.[0] as Record<string, unknown>;
    for (const key of Object.keys(CAMPAIGN_PARAMS)) {
      expect(document).not.toHaveProperty(key);
    }
  });

  it("does not persist empty string fields", async () => {
    await POST(
      makeJsonRequest({
        ...VALID_PAYLOAD,
        FirstName: "",
        LastName: "",
        EmailAddress: "",
        Address: "",
        City: "",
        State: "",
        PostalCode: "",
        BTN: "",
      }),
    );

    const document = createMock.mock.calls[0]?.[0] as Record<string, unknown>;
    for (const key of [
      "FirstName",
      "LastName",
      "EmailAddress",
      "Address",
      "City",
      "State",
      "PostalCode",
      "BTN",
    ]) {
      expect(document).not.toHaveProperty(key);
    }
  });

  it("rejects request bodies over the size limit", async () => {
    const request = new NextRequest(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(64 * 1024 + 1),
      },
      body: "{}",
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("keeps the API audit logging connection", async () => {
    await POST(makeJsonRequest(VALID_PAYLOAD));
    expect(connectMongoose).toHaveBeenCalledTimes(2);
  });

  it("returns 500 when document creation fails", async () => {
    createMock.mockRejectedValueOnce(new Error("DB write failed"));
    const response = await POST(makeJsonRequest(VALID_PAYLOAD));
    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("Internal Server Error");
  });

  it("returns 503 when MongoDB is unavailable", async () => {
    const timeoutError = new Error("Server selection timed out");
    timeoutError.name = "MongooseServerSelectionError";
    (connectMongoose as jest.Mock).mockRejectedValueOnce(timeoutError);
    const response = await POST(makeJsonRequest(VALID_PAYLOAD));
    expect(response.status).toBe(503);
  });
});
