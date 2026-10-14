/**
 * @file __tests__/ftr-forms/api/health.test.ts
 * @description Integration test for the /ftr-forms/api/health Route Handler.
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "@/app/api/health/route";

describe("GET /ftr-forms/api/health", () => {
  it("returns status ok with 200", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/ftr-forms/api/health"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.app).toBe("SFMC");
    expect(body.timestamp).toBeDefined();
  });
});
