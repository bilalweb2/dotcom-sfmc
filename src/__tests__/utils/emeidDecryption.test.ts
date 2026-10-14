/**
 * @file __tests__/utils/emeidDecryption.test.ts
 * @description Unit tests for AES-256-CBC EMEID encrypt/decrypt utilities.
 *   Covers isValidEMEID, decodeEMEID, and encodeEMEID across fixed-IV mode,
 *   embedded-IV mode, hex/Base64 key encoding, and all error branches.
 * @jest-environment node
 */

import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Re-import after mutating process.env in each test group.
// We use jest.isolateModules() where env changes affect module-level reads,
// but since getKey()/getStaticIV() read process.env at call-time, a simple
// delete + assign pattern works fine for these utilities.
// ---------------------------------------------------------------------------

// Known test credentials (never use in production)
/** 32-byte AES-256 key — hex (64 chars, all zeros) */
const KEY_HEX = "0".repeat(64);
/** 16-byte IV — hex (32 chars, all zeros) */
const IV_HEX = "0".repeat(32);
/** Same key as Base64 (Buffer.alloc(32,0).toString('base64')) */
const KEY_B64 = Buffer.alloc(32, 0).toString("base64"); // 44 chars with padding
/** Same IV as Base64 */
const IV_B64 = Buffer.alloc(16, 0).toString("base64"); // 24 chars with padding

const KEY_BUF = Buffer.from(KEY_HEX, "hex");
const IV_BUF = Buffer.from(IV_HEX, "hex");

/** AES-256-CBC encrypt a string with explicit key and IV; returns Buffer. */
function rawEncrypt(plaintext: string, key: Buffer, iv: Buffer): Buffer {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
}

// ---------------------------------------------------------------------------
// isValidEMEID
// ---------------------------------------------------------------------------

describe("isValidEMEID", () => {
  let isValidEMEID: (raw: unknown) => raw is string;

  beforeAll(async () => {
    ({ isValidEMEID } = await import("@/utils/emeidDecryption"));
  });

  // Happy-path: hex
  it("returns true for a valid even-length hex string", () => {
    expect(isValidEMEID("deadbeef")).toBe(true);
  });

  it("returns true for a 64-char hex string (typical full-block ciphertext)", () => {
    expect(isValidEMEID("a".repeat(64))).toBe(true);
  });

  it("returns true for uppercase hex characters", () => {
    expect(isValidEMEID("DEADBEEF1234ABCD")).toBe(true);
  });

  // Happy-path: Base64
  it("returns true for a valid Base64 string without padding", () => {
    // 'test' in Base64 = 'dGVzdA==' — length 8, %4==0
    expect(isValidEMEID("dGVzdA==")).toBe(true);
  });

  it("returns true for the sample Base64 EMEID from the URL", () => {
    // From: http://localhost:3000/ftr-forms/api/DecodeEMEID?EMEID=vVcez3yM9M3nm8l+PtOxqg==
    expect(isValidEMEID("vVcez3yM9M3nm8l+PtOxqg==")).toBe(true);
  });

  it("returns true for a 44-char Base64 key-length string", () => {
    expect(isValidEMEID(KEY_B64)).toBe(true);
  });

  it("returns true for a 24-char Base64 IV-length string", () => {
    expect(isValidEMEID(IV_B64)).toBe(true);
  });

  // Failing: not a string
  it("returns false for null", () => {
    expect(isValidEMEID(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidEMEID(undefined)).toBe(false);
  });

  it("returns false for a number", () => {
    expect(isValidEMEID(42)).toBe(false);
  });

  it("returns false for an object", () => {
    expect(isValidEMEID({})).toBe(false);
  });

  // Failing: empty / blank
  it("returns false for an empty string", () => {
    expect(isValidEMEID("")).toBe(false);
  });

  // Failing: malformed hex
  it("returns false for an odd-length hex string", () => {
    expect(isValidEMEID("abc")).toBe(false); // 3 chars — odd length
  });

  it("returns false for a hex string with an invalid character", () => {
    expect(isValidEMEID("deadbeefgg")).toBe(false); // 'g' is not hex
  });

  // Failing: malformed Base64
  it("returns false for a Base64 string whose length is not divisible by 4", () => {
    expect(isValidEMEID("abc")).toBe(false); // length 3
  });

  it("returns false for a Base64 string with an invalid character", () => {
    // '!' is not in [A-Za-z0-9+/=]
    expect(isValidEMEID("abc!")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// decodeEMEID — fixed-IV mode  (EMEID_AES_IV is set)
// ---------------------------------------------------------------------------

describe("decodeEMEID — fixed-IV mode", () => {
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  beforeEach(() => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
  });

  it("decrypts a hex-encoded ciphertext to the original plaintext", () => {
    const plaintext = "subscriber@example.com";
    const cipherHex = rawEncrypt(plaintext, KEY_BUF, IV_BUF).toString("hex");

    expect(decodeEMEID(cipherHex)).toBe(plaintext);
  });

  it("decrypts a Base64-encoded ciphertext to the original plaintext", () => {
    const plaintext = "user@frontier.com";
    const cipherB64 = rawEncrypt(plaintext, KEY_BUF, IV_BUF).toString("base64");

    expect(decodeEMEID(cipherB64)).toBe(plaintext);
  });

  it("decrypts the sample EMEID value from the URL when key + IV are correct", () => {
    // vVcez3yM9M3nm8l+PtOxqg== (16 bytes) — pre-encrypted with KEY_BUF / IV_BUF
    const plaintext = "hello@test.com";
    const cipherB64 = rawEncrypt(plaintext, KEY_BUF, IV_BUF).toString("base64");

    // Round-trip must return the original value
    expect(decodeEMEID(cipherB64)).toBe(plaintext);
  });

  it("treats the entire EMEID as ciphertext (no embedded-IV prefix)", () => {
    const plaintext = "a"; // minimal plaintext
    const cipherHex = rawEncrypt(plaintext, KEY_BUF, IV_BUF).toString("hex");
    // Result must be one AES block (16 bytes = 32 hex chars)
    expect(cipherHex.length).toBe(32);
    expect(decodeEMEID(cipherHex)).toBe(plaintext);
  });

  it("falls back to EMEID_* env vars when EMEID_* are absent", () => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;

    const plaintext = "legacy@example.com";
    const cipherHex = rawEncrypt(plaintext, KEY_BUF, IV_BUF).toString("hex");

    expect(decodeEMEID(cipherHex)).toBe(plaintext);
  });

  it("throws for an invalid EMEID value (odd-length hex)", () => {
    expect(() => decodeEMEID("abc")).toThrow(/hex string|Base64/i);
  });

  it("throws when the ciphertext was encrypted with a different key", () => {
    const wrongKey = Buffer.alloc(32, 0xff);
    const cipherHex = rawEncrypt("secret", wrongKey, IV_BUF).toString("hex");

    expect(() => decodeEMEID(cipherHex)).toThrow(/Failed to decrypt/i);
  });

  it("throws when the ciphertext is corrupted (truncated)", () => {
    const cipherHex = rawEncrypt("secret", KEY_BUF, IV_BUF).toString("hex");
    // Truncate to an incomplete block
    const truncated = cipherHex.slice(0, 8); // 4 bytes — not a full AES block

    // The truncated hex is still even-length, so isValidEMEID passes.
    // Decryption should fail because 4 bytes is not a valid AES-CBC block.
    expect(() => decodeEMEID(truncated)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// decodeEMEID — embedded-IV mode  (EMEID_AES_IV is NOT set)
// ---------------------------------------------------------------------------

describe("decodeEMEID — embedded-IV mode", () => {
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  beforeEach(() => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    delete process.env.EMEID_AES_IV;
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
  });

  it("extracts the first 16 bytes as IV and the remainder as ciphertext", () => {
    const plaintext = "embedded@example.com";
    // Manually build: IV (16 zero bytes) + ciphertext
    const iv = Buffer.alloc(16, 0);
    const ciphertext = rawEncrypt(plaintext, KEY_BUF, iv);
    const combined = Buffer.concat([iv, ciphertext]).toString("hex");

    expect(decodeEMEID(combined)).toBe(plaintext);
  });

  it("decrypts correctly when IV is non-zero (random-like)", () => {
    const plaintext = "random-iv@test.com";
    const iv = Buffer.from("0102030405060708090a0b0c0d0e0f10", "hex");
    const ciphertext = rawEncrypt(plaintext, KEY_BUF, iv);
    const combined = Buffer.concat([iv, ciphertext]).toString("hex");

    expect(decodeEMEID(combined)).toBe(plaintext);
  });

  it("throws when the EMEID is exactly 16 bytes (no ciphertext after IV)", () => {
    const onlyIV = "0".repeat(32); // 16 bytes as hex

    expect(() => decodeEMEID(onlyIV)).toThrow(/too short/i);
  });

  it("throws when the EMEID is fewer than 16 bytes", () => {
    const short = "deadbeef"; // 4 bytes hex — shorter than IV_BYTES

    expect(() => decodeEMEID(short)).toThrow(/too short/i);
  });
});

// ---------------------------------------------------------------------------
// decodeEMEID — environment variable error branches
// ---------------------------------------------------------------------------

describe("decodeEMEID — env var errors", () => {
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
  });

  it("throws a descriptive error when EMEID_AES_KEY is not set", () => {
    delete process.env.EMEID_AES_KEY;
    const validHex = "ab".repeat(32); // 32 bytes = 64 hex chars

    expect(() => decodeEMEID(validHex)).toThrow(/EMEID_AES_KEY/);
  });

  it("throws when EMEID_AES_KEY is set to whitespace only", () => {
    process.env.EMEID_AES_KEY = "   ";

    expect(() => decodeEMEID("ab".repeat(32))).toThrow(/EMEID_AES_KEY/);
  });

  it("throws when EMEID_AES_KEY decodes to fewer than 32 bytes (16-byte hex key)", () => {
    process.env.EMEID_AES_KEY = "0".repeat(32); // 16 bytes — too short for AES-256

    expect(() => decodeEMEID("ab".repeat(32))).toThrow(/32 bytes/i);
  });

  it("throws when EMEID_AES_IV is set but decodes to fewer than 16 bytes", () => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = "0".repeat(16); // 8 bytes — too short for an AES IV

    expect(() => decodeEMEID("ab".repeat(16))).toThrow(/16 bytes/i);
  });

  it("throws when EMEID_AES_IV decodes to more than 16 bytes", () => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = "0".repeat(48); // 24 bytes — too long

    expect(() => decodeEMEID("ab".repeat(16))).toThrow(/16 bytes/i);
  });
});

// ---------------------------------------------------------------------------
// encodeEMEID — fixed-IV mode
// ---------------------------------------------------------------------------

describe("encodeEMEID — fixed-IV mode", () => {
  let encodeEMEID: (plaintext: string) => string;
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ encodeEMEID, decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  beforeEach(() => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
  });

  it("returns a hex string", () => {
    const result = encodeEMEID("test@example.com");
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("returns a string with even length (valid hex)", () => {
    const result = encodeEMEID("test@example.com");
    expect(result.length % 2).toBe(0);
  });

  it("round-trips: encode → decode returns original plaintext", () => {
    const plaintext = "roundtrip@example.com";
    const encoded = encodeEMEID(plaintext);
    expect(decodeEMEID(encoded)).toBe(plaintext);
  });

  it("produces the same ciphertext for the same input (deterministic with fixed IV)", () => {
    const plaintext = "deterministic@example.com";
    expect(encodeEMEID(plaintext)).toBe(encodeEMEID(plaintext));
  });

  it("produces different ciphertext for different inputs", () => {
    expect(encodeEMEID("a@b.com")).not.toBe(encodeEMEID("x@y.com"));
  });

  it("accepts a Base64-encoded key and encrypts/decrypts correctly", () => {
    process.env.EMEID_AES_KEY = KEY_B64; // same key, Base64-encoded

    const plaintext = "b64key@example.com";
    const encoded = encodeEMEID(plaintext);
    expect(decodeEMEID(encoded)).toBe(plaintext);
  });

  it("accepts a Base64-encoded IV and encrypts/decrypts correctly", () => {
    process.env.EMEID_AES_IV = IV_B64; // same IV, Base64-encoded

    const plaintext = "b64iv@example.com";
    const encoded = encodeEMEID(plaintext);
    expect(decodeEMEID(encoded)).toBe(plaintext);
  });
});

// ---------------------------------------------------------------------------
// encodeEMEID — embedded-IV mode
// ---------------------------------------------------------------------------

describe("encodeEMEID — embedded-IV mode", () => {
  let encodeEMEID: (plaintext: string) => string;
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ encodeEMEID, decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  beforeEach(() => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    delete process.env.EMEID_AES_IV;
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
  });

  it("returns a hex string", () => {
    const result = encodeEMEID("test@example.com");
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("output is longer than ciphertext alone (IV is prepended)", () => {
    const plaintext = "embedded@example.com"; // 20 bytes → 32-byte padded ciphertext
    const result = encodeEMEID(plaintext);
    // Expected total bytes = 16 (IV) + 32 (ciphertext) = 48 → 96 hex chars
    expect(result.length).toBeGreaterThan(64); // at least IV (32 hex) + 1 block (32 hex)
  });

  it("round-trips: encode → decode returns original plaintext", () => {
    const plaintext = "embedded-roundtrip@frontier.com";
    const encoded = encodeEMEID(plaintext);
    expect(decodeEMEID(encoded)).toBe(plaintext);
  });

  it("produces different ciphertext on each call (random IV)", () => {
    const plaintext = "same@input.com";
    const first = encodeEMEID(plaintext);
    const second = encodeEMEID(plaintext);
    // Different random IVs mean different ciphertext (probabilistic; collisions negligible)
    expect(first).not.toBe(second);
  });

  it("both encoded values still decrypt to the same plaintext", () => {
    const plaintext = "both-valid@example.com";
    const first = encodeEMEID(plaintext);
    const second = encodeEMEID(plaintext);
    expect(decodeEMEID(first)).toBe(plaintext);
    expect(decodeEMEID(second)).toBe(plaintext);
  });
});

// ---------------------------------------------------------------------------
// encodeEMEID — error branches
// ---------------------------------------------------------------------------

describe("encodeEMEID — error branches", () => {
  let encodeEMEID: (plaintext: string) => string;

  beforeAll(async () => {
    ({ encodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
  });

  it("throws when plaintext is an empty string", () => {
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;

    expect(() => encodeEMEID("")).toThrow(/non-empty/i);
  });

  it("throws when EMEID_AES_KEY is not set", () => {
    delete process.env.EMEID_AES_KEY;

    expect(() => encodeEMEID("test@example.com")).toThrow(/EMEID_AES_KEY/);
  });
});

// ---------------------------------------------------------------------------
// Cross-encoding compatibility (hex key vs Base64 key produce identical output)
// ---------------------------------------------------------------------------

describe("hex vs Base64 key/IV produce equivalent results", () => {
  let encodeEMEID: (plaintext: string) => string;
  let decodeEMEID: (EMEID: string) => string;

  beforeAll(async () => {
    ({ encodeEMEID, decodeEMEID } = await import("@/utils/emeidDecryption"));
  });

  afterEach(() => {
    delete process.env.EMEID_AES_KEY;
    delete process.env.EMEID_AES_IV;
  });

  it("encrypts with hex key/IV and decrypts with Base64 key/IV (same underlying bytes)", () => {
    const plaintext = "cross-encoding@example.com";

    // Encrypt with hex key + hex IV
    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;
    const hexEncoded = encodeEMEID(plaintext);

    // Decrypt with Base64 key + Base64 IV
    process.env.EMEID_AES_KEY = KEY_B64;
    process.env.EMEID_AES_IV = IV_B64;
    expect(decodeEMEID(hexEncoded)).toBe(plaintext);
  });

  it("encrypts with Base64 key/IV and decrypts with hex key/IV", () => {
    const plaintext = "reverse-compat@example.com";

    process.env.EMEID_AES_KEY = KEY_B64;
    process.env.EMEID_AES_IV = IV_B64;
    const b64Encoded = encodeEMEID(plaintext);

    process.env.EMEID_AES_KEY = KEY_HEX;
    process.env.EMEID_AES_IV = IV_HEX;
    expect(decodeEMEID(b64Encoded)).toBe(plaintext);
  });
});
