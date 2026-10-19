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
  maskEmail: jest.fn((email: string | null | undefined) => {
    if (!email) return "[no email]";
    return `${email[0]}***@${email.split("@")[1] ?? "[unknown]"}`;
  }),
  maskPhone: jest.fn(() => "***-***-1234"),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { connectMongoose } from "@/libs/mongoose";
import { getAzureInsightsClient } from "@/libs/azureInsights";
import { getNewRelicAgent } from "@/libs/newRelic";
import { AuditLogModel } from "@/models/AuditLog";
import { logApiExchange, sanitizeBody } from "@/utils/apiLog";

describe("sanitizeBody", () => {
  it("masks emails in JSON and redacts secrets", () => {
    const body = sanitizeBody(
      JSON.stringify({
        EmailAddress: "jane@example.com",
        token: "secret-token",
      }),
    );

    expect(body).toContain("j***@example.com");
    expect(body).not.toContain("jane@example.com");
    expect(body).toContain("[REDACTED]");
    expect(body).not.toContain("secret-token");
  });

  it("redacts secrets in form posts", () => {
    const body = sanitizeBody(
      "EmailAddress=jane%40example.com&password=hunter2",
    );

    expect(body).toContain("EmailAddress=j***%40example.com");
    expect(body).not.toContain("jane%40example.com");
    expect(body).toContain("password=%5BREDACTED%5D");
    expect(body).not.toContain("hunter2");
  });

  it("masks emails and redacts secrets in form posts", () => {
    const body = sanitizeBody("EmailAddress=jane%40example.com&token=hunter2");

    expect(body).toContain("EmailAddress=j***%40example.com");
    expect(body).toContain("token=%5BREDACTED%5D");
    expect(body).not.toContain("jane%40example.com");
    expect(body).not.toContain("hunter2");
  });

  it("masks emails embedded in free text", () => {
    const body = sanitizeBody("Request for jane@example.com failed");

    expect(body).toContain("j***@example.com");
    expect(body).not.toContain("jane@example.com");
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
      query: "?source=email&EmailAddress=jane%40example.com",
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
      query: "?source=email&EmailAddress=j***%40example.com",
      status: 200,
      durationMs: 42,
      requestId: "req-123",
      request: {
        EmailAddress: "j***@example.com",
        token: "[REDACTED]",
      },
      response: { success: true },
    });
    expect(AuditLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.not.stringContaining("secret-token"),
        query: expect.not.stringContaining("jane@example.com"),
      }),
    );
  });

  it("sends sanitized body and query data to telemetry", async () => {
    const trackRequest = jest.fn();
    const trackTrace = jest.fn();
    const recordLogEvent = jest.fn();
    (getAzureInsightsClient as jest.Mock).mockResolvedValue({
      trackRequest,
      trackTrace,
    });
    (getNewRelicAgent as jest.Mock).mockResolvedValue({ recordLogEvent });

    await logApiExchange({
      method: "POST",
      path: "/api/submit",
      query: "?EmailAddress=jane%40example.com",
      status: 200,
      durationMs: 5,
      requestBody: JSON.stringify({ EmailAddress: "jane@example.com" }),
      responseBody: JSON.stringify({ decoded: "jane@example.com" }),
      requestId: "req-456",
    });

    const telemetry = JSON.stringify([
      trackRequest.mock.calls,
      trackTrace.mock.calls,
      recordLogEvent.mock.calls,
    ]);
    expect(telemetry).toContain("j***@example.com");
    expect(telemetry).not.toContain("jane@example.com");
  });
});
