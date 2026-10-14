/**
 * @file __tests__/ftr-forms/api/health.test.ts
 * @description Integration test for the /ftr-forms/api/health Route Handler.
 * @jest-environment node
 */

jest.mock("@/libs/mongoose", () => ({
  connectMongoose: jest.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/health/route";
import { connectMongoose } from "@/libs/mongoose";

describe("GET /ftr-forms/api/health", () => {
   beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns status ok with 200", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/ftr-forms/api/health"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.app).toBe("SFMC");
    expect(body.timestamp).toBeDefined();
    expect(connectMongoose).toHaveBeenCalled();
  });

  it("returns 503 when MongoDB server selection times out", async () => {
    const timeoutError = new Error("Server selection timed out");
    timeoutError.name = "MongooseServerSelectionError";
    (connectMongoose as jest.Mock).mockRejectedValueOnce(timeoutError);

    const response = await GET(
      new NextRequest("http://localhost:3000/ftr-forms/api/health"),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Database temporarily unavailable");
    expect(connectMongoose).toHaveBeenCalledTimes(1);
  });
});
