/**
 * @file __tests__/utils/emeidValidation.test.ts
 * @description Unit tests for the DecodeEMEID Zod validation schema.
 *   Covers both hex and Base64 encodings for EMEID and optional CUHID.
 * @jest-environment node
 */

import { DecodeEMEIDSchema } from "@/utils/emeidValidation";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** 64-char hex string — typical full-block EMEID (32 bytes with embedded IV) */
const VALID_HEX_EMEID = "a".repeat(64);

/** 96-char hex string — 48-byte EMEID with embedded 16-byte IV + 32-byte ciphertext */
const VALID_HEX_EMEID_LONG = "b".repeat(96);

/** 24-char Base64 EMEID from the sample URL — vVcez3yM9M3nm8l+PtOxqg== */
const VALID_B64_EMEID = "vVcez3yM9M3nm8l+PtOxqg==";

/** 64-char hex CUHID (optional field) */
const VALID_HEX_CUHID =
  "ce657692ae19f328a459aa07b327136e665b02b9fb29f4768cede5ffb26e968f";

// ---------------------------------------------------------------------------
// Valid inputs
// ---------------------------------------------------------------------------

describe("DecodeEMEIDSchema — valid inputs", () => {
  it("passes with a valid hex EMEID and no CUHID", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: VALID_HEX_EMEID });
    expect(result.success).toBe(true);
  });

  it("passes with a valid Base64 EMEID (from sample URL) and no CUHID", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: VALID_B64_EMEID });
    expect(result.success).toBe(true);
  });

  it("passes with a valid hex EMEID and a valid hex CUHID", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: VALID_HEX_CUHID,
    });
    expect(result.success).toBe(true);
  });

  it("passes with a Base64 EMEID and a Base64 CUHID", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_B64_EMEID,
      CUHID: "AAAAAAAAAAAAAAAAAAAAAA==", // 24-char Base64
    });
    expect(result.success).toBe(true);
  });

  it("passes with a longer hex EMEID (embedded-IV format)", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID_LONG,
    });
    expect(result.success).toBe(true);
  });

  it("preserves the EMEID value in parsed output", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: VALID_HEX_EMEID });
    expect(result.success && result.data.EMEID).toBe(VALID_HEX_EMEID);
  });

  it("preserves the CUHID value in parsed output when provided", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: VALID_HEX_CUHID,
    });
    expect(result.success && result.data.CUHID).toBe(VALID_HEX_CUHID);
  });

  it("sets CUHID to undefined when omitted", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: VALID_HEX_EMEID });
    expect(result.success && result.data.CUHID).toBeUndefined();
  });

  it("accepts uppercase hex characters in EMEID", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: "DEADBEEF".repeat(8), // 64 chars
    });
    expect(result.success).toBe(true);
  });

  it("accepts mixed-case hex in EMEID", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: "DeAdBeEf".repeat(8), // 64 chars
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EMEID — invalid / missing
// ---------------------------------------------------------------------------

describe("DecodeEMEIDSchema — EMEID validation failures", () => {
  it("fails when EMEID is absent", () => {
    const result = DecodeEMEIDSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("fails when EMEID is an empty string", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "" });
    expect(result.success).toBe(false);
  });

  it("fails when EMEID has odd hex length", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "abc" }); // 3 chars
    expect(result.success).toBe(false);
  });

  it("fails when EMEID contains non-hex characters (not Base64 either)", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "gg" }); // 'g' invalid hex
    expect(result.success).toBe(false);
  });

  it("fails when EMEID length is not divisible by 4 (invalid Base64 length)", () => {
    // 'abcde' is 5 chars — not a valid hex (odd after even check fails), nor valid Base64 length
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "abcde" });
    expect(result.success).toBe(false);
  });

  it("fails when EMEID contains a Base64 invalid character like '!'", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "abc!" });
    expect(result.success).toBe(false);
  });

  it("fails when EMEID is a number (wrong type)", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: 12345 });
    expect(result.success).toBe(false);
  });

  it("fails when EMEID is null", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: null });
    expect(result.success).toBe(false);
  });

  it("reports a field error on EMEID key", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "" });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      expect(flat).toHaveProperty("EMEID");
    }
  });

  it("includes a descriptive message when EMEID encoding is invalid", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: "abc!" });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      expect(flat.EMEID?.join(" ")).toMatch(/hex|Base64/i);
    }
  });
});

// ---------------------------------------------------------------------------
// CUHID — optional but validated when present
// ---------------------------------------------------------------------------

describe("DecodeEMEIDSchema — CUHID validation (optional field)", () => {
  it("passes when CUHID is omitted", () => {
    const result = DecodeEMEIDSchema.safeParse({ EMEID: VALID_HEX_EMEID });
    expect(result.success).toBe(true);
  });

  it("passes when CUHID is a valid 64-char hex string", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: VALID_HEX_CUHID,
    });
    expect(result.success).toBe(true);
  });

  it("fails when CUHID is provided but is an empty string", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when CUHID has an odd hex length", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: "abc", // 3 chars — odd length
    });
    expect(result.success).toBe(false);
  });

  it("fails when CUHID contains invalid characters", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: "xyz!", // invalid chars
    });
    expect(result.success).toBe(false);
  });

  it("reports a field error on CUHID key when CUHID encoding is invalid", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      CUHID: "!!!!",
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      expect(flat).toHaveProperty("CUHID");
    }
  });
});

// ---------------------------------------------------------------------------
// Extra fields ignored
// ---------------------------------------------------------------------------

describe("DecodeEMEIDSchema — extra query parameters", () => {
  it("ignores unknown extra fields and still passes", () => {
    const result = DecodeEMEIDSchema.safeParse({
      EMEID: VALID_HEX_EMEID,
      unknownParam: "ignored",
    });
    // Zod strips unknown keys by default
    expect(result.success).toBe(true);
  });
});
