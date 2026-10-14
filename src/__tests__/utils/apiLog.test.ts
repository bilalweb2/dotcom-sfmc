/**
 * @file __tests__/utils/apiLog.test.ts
 * @description Unit tests for API log body sanitising and audit persistence.
 * @jest-environment node
 */

jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
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
}));

import { connectMongoose } from "@/libs/mongoose";
import { AuditLogModel } from "@/models/AuditLog";
import { logApiExchange, sanitizeBody } from "@/utils/apiLog";

describe("sanitizeBody", () => {
  it("keeps a JSON request and redacts secrets", () => {
    const body = sanitizeBody(
      JSON.stringify({
        EmailAddress: "jane@example.com",
        token: "secret-token",
      }),
    );

    expect(body).toContain("jane@example.com");
    expect(body).toContain("[REDACTED]");
    expect(body).not.toContain("secret-token");
  });

  it("redacts secrets in form posts", () => {
    const body = sanitizeBody(
      "EmailAddress=jane%40example.com&password=hunter2",
    );

    expect(body).toContain("EmailAddress=jane%40example.com");
    expect(body).toContain("password=%5BREDACTED%5D");
    expect(body).not.toContain("hunter2");
  });
});

describe("logApiExchange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists a sanitised audit record to MongoDB", async () => {
    await logApiExchange({
      method: "POST",
      path: "/ftr-forms/api/UnsubFormProcessing",
      query: "?source=email",
      status: 200,
      durationMs: 42,
      requestBody: JSON.stringify({
        EmailAddress: "jane@example.com",
        token: "secret-token",
      }),
      responseBody: JSON.stringify({ success: true }),
      requestId: "req-123",
    });

    expect(connectMongoose).toHaveBeenCalledTimes(1);
    expect(AuditLogModel.create).toHaveBeenCalledWith({
      method: "POST",
      path: "/ftr-forms/api/UnsubFormProcessing",
      query: "?source=email",
      status: 200,
      durationMs: 42,
      requestId: "req-123",
      request: {
        EmailAddress: expect.stringContaining("jane@example.com"),
        token: "[REDACTED]",
      },
      response: { success: true },
    });
    expect(AuditLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.not.stringContaining("secret-token"),
      }),
    );
  });
});
