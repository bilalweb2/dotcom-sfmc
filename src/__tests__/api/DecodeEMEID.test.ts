/**
 * @file __tests__/api/DecodeEMEID.test.ts
 * @description Unit tests for GET /ftr-forms/api/DecodeEMEID
 *   Tests validation, happy-path decryption, Base64 normalisation, CUHID
 *   pass-through, and all error branches at the API layer.
 * @jest-environment node
 */

// ── Mocks (must be before any imports that pull in the mocked modules) ──────

jest.mock("@/utils/emeidDecryption", () => ({
  decodeEMEID: jest.fn().mockReturnValue("subscriber@example.com"),
  isValidEMEID: jest.fn().mockReturnValue(true),
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
}));

// ── Imports ──────────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { GET } from "@/app/api/DecodeEMEID/route";
import { decodeEMEID } from "@/utils/emeidDecryption";
import logger from "@/logger";

// ── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000/ftr-forms/api/DecodeEMEID";

/** 64-char hex EMEID (valid encoding). */
const HEX_EMEID = "a".repeat(64);

/** 24-char Base64 EMEID matching the sample from the URL. */
const B64_EMEID = "vVcez3yM9M3nm8l+PtOxqg==";

/** 64-char hex CUHID. */
const HEX_CUHID =
  "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f";

function makeGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url.toString(), { method: "GET" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /ftr-forms/api/DecodeEMEID", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Happy-path: hex EMEID ──────────────────────────────────────────────────

  describe("happy path — hex EMEID", () => {
    it("returns 200 when a valid hex EMEID is provided", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(res.status).toBe(200);
    });

    it("returns a JSON body with decoded value", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const body = await res.json();
      expect(body.data.decoded).toBe("subscriber@example.com");
    });

    it("returns cuhid as null when CUHID is not supplied", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const body = await res.json();
      expect(body.data.cuhid).toBeNull();
    });

    it("calls decodeEMEID with the hex EMEID value", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(decodeEMEID).toHaveBeenCalledWith(HEX_EMEID);
    });

    it("calls decodeEMEID exactly once", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(decodeEMEID).toHaveBeenCalledTimes(1);
    });
  });

  // ── Happy-path: Base64 EMEID ───────────────────────────────────────────────

  describe("happy path — Base64 EMEID", () => {
    it("accepts the legacy EMEID query param alias", async () => {
      const res = await GET(makeGetRequest({ EMEID: B64_EMEID }));
      expect(res.status).toBe(200);
    });

    it("returns 200 for a Base64-encoded EMEID", async () => {
      const res = await GET(makeGetRequest({ EMEID: B64_EMEID }));
      expect(res.status).toBe(200);
    });

    it("calls decodeEMEID with the Base64 value ('+' preserved, not space)", async () => {
      // The route normalises '+' → ' ' from URLSearchParams back to '+'
      // so decodeEMEID must receive the original '+' in the Base64 string.
      await GET(makeGetRequest({ EMEID: B64_EMEID }));
      expect(decodeEMEID).toHaveBeenCalledWith(B64_EMEID);
    });

    it("normalises space back to '+' (URL-encoded '+' arrives as space)", async () => {
      // URLSearchParams decodes '+' as a space character. Simulate this by
      // constructing the request URL with spaces in the EMEID value directly.
      const spaceEMEID = B64_EMEID.replace(/\+/g, " "); // '+' replaced by space
      const url = new URL(BASE_URL);
      // Manually set the raw search to avoid re-encoding by URL constructor
      url.search = `?EMEID=${encodeURIComponent(spaceEMEID)}`;
      const req = new NextRequest(url.toString(), { method: "GET" });

      await GET(req);

      // The route must normalise spaces back to '+' before calling decodeEMEID
      expect(decodeEMEID).toHaveBeenCalledWith(B64_EMEID);
    });
  });

  // ── CUHID pass-through ─────────────────────────────────────────────────────

  describe("CUHID pass-through", () => {
    it("returns the CUHID in the response when provided", async () => {
      const res = await GET(
        makeGetRequest({ EMEID: HEX_EMEID, CUHID: HEX_CUHID }),
      );
      const body = await res.json();
      expect(body.data.cuhid).toBe(HEX_CUHID);
    });

    it("returns 200 when both EMEID and CUHID are valid", async () => {
      const res = await GET(
        makeGetRequest({ EMEID: HEX_EMEID, CUHID: HEX_CUHID }),
      );
      expect(res.status).toBe(200);
    });

    it("does not pass CUHID to decodeEMEID (only EMEID is decrypted)", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID, CUHID: HEX_CUHID }));
      expect(decodeEMEID).toHaveBeenCalledWith(HEX_EMEID);
      expect(decodeEMEID).not.toHaveBeenCalledWith(HEX_CUHID);
    });
  });

  // ── Logging ────────────────────────────────────────────────────────────────

  describe("logging", () => {
    it("logs at info level on successful decryption", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(logger.info).toHaveBeenCalledWith(
        "EMEID decoded successfully",
        expect.objectContaining({ cuhid: null }),
      );
    });

    it("logs cuhid in the info message when CUHID is supplied", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID, CUHID: HEX_CUHID }));
      expect(logger.info).toHaveBeenCalledWith(
        "EMEID decoded successfully",
        expect.objectContaining({ cuhid: HEX_CUHID }),
      );
    });

    it("does NOT log the raw decoded value (PII safety)", async () => {
      await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const infoCall = (logger.info as jest.Mock).mock.calls[0];
      const loggedPayload = JSON.stringify(infoCall);
      // The unmasked email must not appear verbatim in the log call
      expect(loggedPayload).not.toContain("subscriber@example.com");
    });
  });

  // ── Validation failures (400) ──────────────────────────────────────────────

  describe("validation failures — 400", () => {
    it("returns 400 when EMEID is absent", async () => {
      const res = await GET(makeGetRequest({}));
      expect(res.status).toBe(400);
    });

    it("returns an error body with 'Validation failed' message", async () => {
      const res = await GET(makeGetRequest({}));
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
    });

    it("returns field errors for missing EMEID", async () => {
      const res = await GET(makeGetRequest({}));
      const body = await res.json();
      expect(body.details).toHaveProperty("EMEID");
    });

    it("includes a timestamp in the 400 error body", async () => {
      const res = await GET(makeGetRequest({}));
      const body = await res.json();
      expect(body.timestamp).toBeDefined();
    });

    it("returns 400 for an odd-length hex EMEID (invalid encoding)", async () => {
      const res = await GET(makeGetRequest({ EMEID: "abc" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for an EMEID with invalid characters", async () => {
      // '!' is not in the hex alphabet ([0-9a-fA-F]) nor the Base64 alphabet ([A-Za-z0-9+/=])
      // Length 8 is even (bypasses hex odd-length check) but fails the hex char test,
      // and '!' fails the Base64 char test — so the encoding is entirely invalid.
      const res = await GET(makeGetRequest({ EMEID: "!!!!!!!!" }));
      expect(res.status).toBe(400);
    });

    it("does not call decodeEMEID when validation fails", async () => {
      await GET(makeGetRequest({}));
      expect(decodeEMEID).not.toHaveBeenCalled();
    });

    it("returns 400 when CUHID is provided but invalid (while EMEID is valid)", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID, CUHID: "!!!" }));
      expect(res.status).toBe(400);
    });
  });

  // ── Decryption failure (500) ───────────────────────────────────────────────

  describe("decryption failure — 500", () => {
    it("returns 500 when decodeEMEID throws an error", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to decrypt EMEID — verify key");
      });

      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(res.status).toBe(500);
    });

    it("includes the error message in the 500 body", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to decrypt EMEID — verify key");
      });

      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const body = await res.json();
      expect(body.error).toContain("Failed to decrypt");
    });

    it("logs the decryption error at error level", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Bad key");
      });

      await GET(makeGetRequest({ EMEID: HEX_EMEID }));

      expect(logger.error).toHaveBeenCalledWith(
        "EMEID decryption failed",
        expect.objectContaining({ error: "Bad key" }),
      );
    });

    it("includes EMEIDLength in the error log", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Bad key");
      });

      await GET(makeGetRequest({ EMEID: HEX_EMEID }));

      expect(logger.error).toHaveBeenCalledWith(
        "EMEID decryption failed",
        expect.objectContaining({ emeidLength: HEX_EMEID.length }),
      );
    });

    it("returns 500 when decodeEMEID throws a non-Error object", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        // eslint-disable-next-line no-throw-literal
        throw "string error"; // non-Error throw
      });

      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(res.status).toBe(500);
    });

    it("uses 'Decryption error' message when thrown value is not an Error", async () => {
      (decodeEMEID as jest.Mock).mockImplementationOnce(() => {
        // eslint-disable-next-line no-throw-literal
        throw 42;
      });

      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const body = await res.json();
      expect(body.error).toBe("Decryption error");
    });
  });

  // ── Response shape ─────────────────────────────────────────────────────────

  describe("response shape", () => {
    it("wraps the payload inside a 'data' key on success", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      const body = await res.json();
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("decoded");
      expect(body.data).toHaveProperty("cuhid");
    });

    it("returns Content-Type application/json", async () => {
      const res = await GET(makeGetRequest({ EMEID: HEX_EMEID }));
      expect(res.headers.get("content-type")).toMatch(/application\/json/);
    });
  });
});
