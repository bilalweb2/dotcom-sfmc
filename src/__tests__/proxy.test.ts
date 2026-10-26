import { NextRequest } from "next/server";
import { logApiExchange } from "@/utils/apiLog";
import logger from "@/logger";
import { proxy } from "@/proxy";

jest.mock("@/logger", () => ({
  __esModule: true,
  default: { warn: jest.fn() },
}));

jest.mock("@/utils/apiLog", () => ({
  logApiExchange: jest.fn().mockResolvedValue(undefined),
}));

function createRequest(
  pathname: string,
  method = "GET",
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost"), {
    method,
    headers,
  });
}

describe("proxy", () => {
  it("allows CORS preflight requests and attaches the security headers", () => {
    const response = proxy(
      createRequest("/ftr-forms/api/private", "OPTIONS", {
        "x-forwarded-for": "192.0.2.1",
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(response.headers.get("content-security-policy")).toContain(
      "'strict-dynamic'",
    );
  });

  it("allows public API routes without an authorization token", () => {
    const response = proxy(
      createRequest("/ftr-forms/api/health", "GET", {
        "x-forwarded-for": "192.0.2.2",
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.status).toBe(200);
  });

  it("rejects private API requests without a bearer token", async () => {
    const response = proxy(
      createRequest("/ftr-forms/api/private", "GET", {
        "x-forwarded-for": "192.0.2.3",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Unauthorized",
    });
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(logApiExchange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 }),
    );
  });

  it("allows private API requests with a bearer token", () => {
    const response = proxy(
      createRequest("/ftr-forms/api/private", "GET", {
        authorization: "Bearer valid-token",
        "x-forwarded-for": "192.0.2.4",
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.status).toBe(200);
  });

  it("rate limits requests above the per-IP limit", async () => {
    const headers = { "x-forwarded-for": "192.0.2.5" };
    let response;
    for (let requestNumber = 0; requestNumber <= 120; requestNumber += 1) {
      response = proxy(createRequest("/ftr-forms/api/health", "GET", headers));
    }

    expect(response?.status).toBe(429);
    await expect(response?.json()).resolves.toMatchObject({
      error: "Too Many Requests",
    });
    expect(response?.headers.get("retry-after")).toBeTruthy();
    expect(logger.warn).toHaveBeenCalledWith(
      "Global rate limit exceeded in proxy",
      expect.objectContaining({ ip: "192.0.2.5" }),
    );
  });
});
