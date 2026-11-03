/**
 * @file __tests__/api/WHWF_Processing.test.ts
 * @description Unit tests for POST /ftr-forms/api/WHWF_Processing
 * @jest-environment node
 */

jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/WholeHomeWifi", () => ({
  WholeHomeWifiModel: {
    create: jest.fn().mockResolvedValue({ _id: "mock-id" }),
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
import { POST } from "@/app/api/WHWF_Processing/route";
import { WholeHomeWifiModel } from "@/models/WholeHomeWifi";
import { connectMongoose } from "@/libs/mongoose";

const BASE_URL = "http://localhost:3000/ftr-forms/api/WHWF_Processing";

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
  PageName: "BAU WHWF - v1",
  Offer: "$0 for 1 month and then $10/mo.",
  ConfirmationCheckBox: 1,
};

const CAMPAIGN_PARAMS = {
  EMHID: "881b88812e0c7e2354153d8a7f967651",
  EMEID: "vVcez3yM9M3nm8l+PtOxqg==",
  CUHID: "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f",
  CMP: "CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST",
  BID: "628055001",
};
const createMock = WholeHomeWifiModel.create as jest.Mock;

describe("POST /ftr-forms/api/WHWF_Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with { status: "OK", result: "1" }', async () => {
    const response = await POST(makeJsonRequest(VALID_PAYLOAD));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "OK", result: "1" });
  });

  it("creates a document for each request and excludes GBLUID", async () => {
    await POST(makeJsonRequest({ ...VALID_PAYLOAD, GBLUID: "legacy-id" }));
    await POST(makeJsonRequest({ ...VALID_PAYLOAD, GBLUID: "legacy-id" }));

    expect(createMock).toHaveBeenCalledTimes(2);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        FirstName: "Jane",
        LastName: "Doe",
        EmailAddress: "jane.doe@example.com",
        PageName: "BAU WHWF - v1",
        Offer: "$0 for 1 month and then $10/mo.",
        ConfirmationCheckBox: true,
      }),
    );
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

  it("sanitises submitted form fields and coerces checkbox values", async () => {
    await POST(
      makeJsonRequest({
        ...VALID_PAYLOAD,
        FirstName: "<b>Jane</b>",
        ConfirmationCheckBox: 0,
      }),
    );

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        FirstName: "Jane",
        ConfirmationCheckBox: false,
      }),
    );
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

  it("returns 500 when request body is not valid JSON", async () => {
    const request = new NextRequest(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{{",
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
