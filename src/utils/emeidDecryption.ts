/**
 * @file utils/emeidDecryption.ts
 * @description AES-256-CBC decryption utility for Adobe Campaign EMEID tokens.
 *
 * Adobe Campaign appends an EMEID (Email Hash ID) query-string parameter to
 * every tracked link click.  The value is the subscriber's email address (or
 * another identifier) encrypted with AES-256-CBC.
 *
 * Accepted encodings for EMEID_AES_KEY, EMEID_AES_IV, and the EMEID value:
 *  - Hex    — even-length string of [0-9a-fA-F] characters
 *  - Base64 — length ÷ 4, characters [A-Za-z0-9+/=]
 *
 * IV strategy (controlled by environment variables):
 *  - When EMEID_AES_IV is set   → that fixed 16-byte IV is used and the
 *    entire EMEID value is treated as ciphertext.
 *  - When EMEID_AES_IV is unset → the first 16 bytes of the decoded EMEID
 *    are the embedded IV and the remainder is the ciphertext (Adobe Campaign
 *    default for hex-encoded tokens).
 *
 * Required env vars:
 *  - EMEID_AES_KEY  32 bytes — hex (64 chars) or Base64 (44 chars with padding)
 *
 * Optional env vars:
 *  - EMEID_AES_IV   16 bytes — hex (32 chars) or Base64 (24 chars with padding)
 */

import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AES_ALGORITHM = "aes-256-cbc" as const;
const KEY_BYTES = 32; // AES-256 → 32-byte key
const IV_BYTES = 16; // AES block size → 16-byte IV

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Decodes a raw string value that may be either hex or Base64 into a Buffer.
 *
 * Detection rules:
 *  - Hex    → only [0-9a-fA-F] characters with even length
 *  - Base64 → everything else (delegates to Node's Buffer.from with 'base64')
 */
function decodeEncodedBuffer(raw: string): Buffer {
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
    return Buffer.from(raw, "hex");
  }
  return Buffer.from(raw, "base64");
}

/**
 * Reads and validates EMEID_AES_KEY from the environment.
 * Accepts either a 64-character hex string or a Base64-encoded 32-byte value.
 * Throws a descriptive error when the variable is absent or malformed.
 */
function getKey(): Buffer {
  const keyRaw = process.env.EMEID_AES_KEY;
  if (!keyRaw?.trim()) {
    throw new Error(
      "EMEID_AES_KEY environment variable is not set. " +
        "Provide a 32-byte value as hex (64 chars) or Base64 (44 chars with padding).",
    );
  }

  const key = decodeEncodedBuffer(keyRaw);
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `EMEID_AES_KEY decoded to ${key.length} bytes — expected exactly ${KEY_BYTES} bytes ` +
        "(64 hex characters or 44 Base64 characters with '=' padding).",
    );
  }

  return key;
}

/**
 * Reads EMEID_AES_IV from the environment.
 * Accepts either a 32-character hex string or a Base64-encoded 16-byte value.
 * Returns null when the variable is absent (embedded-IV mode).
 * Throws when the variable is present but malformed.
 */
function getStaticIV(): Buffer | null {
  const ivRaw = process.env.EMEID_AES_IV;
  if (!ivRaw?.trim()) return null;

  const iv = decodeEncodedBuffer(ivRaw);
  if (iv.length !== IV_BYTES) {
    throw new Error(
      `EMEID_AES_IV decoded to ${iv.length} bytes — expected exactly ${IV_BYTES} bytes ` +
        "(32 hex characters or 24 Base64 characters with '=' padding).",
    );
  }

  return iv;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates that `raw` is a non-empty hex or Base64 encoded string.
 *
 * Accepts:
 *  - Hex    — even-length, only [0-9a-fA-F] characters
 *  - Base64 — length divisible by 4, characters [A-Za-z0-9+/] with optional '=' padding
 */
export function isValidEMEID(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length === 0) return false;
  // Hex: only hex chars with even length
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) return true;
  // Base64: standard alphabet with optional '=' padding, length divisible by 4
  if (/^[A-Za-z0-9+/]+=*$/.test(raw) && raw.length % 4 === 0) return true;
  return false;
}

/**
 * Decrypts an AES-256-CBC encoded EMEID string and returns the plaintext.
 *
 * @param emeid  The raw hex EMEID value from the query string.
 * @returns      The decrypted plaintext (e.g. an email address).
 * @throws       When the key/IV env vars are missing or malformed, or when the
 *               EMEID value is invalid / cannot be deciphered.
 */
export function decodeEMEID(emeid: string): string {
  if (!isValidEMEID(emeid)) {
    throw new Error(
      "EMEID must be a non-empty hex string (even length, 0-9 a-f) or Base64 string (length ÷ 4, A-Za-z0-9+/=).",
    );
  }

  const key = getKey();
  const emeidBuffer = decodeEncodedBuffer(emeid);

  let iv: Buffer;
  let ciphertext: Buffer;

  const staticIV = getStaticIV();
  if (staticIV) {
    // Fixed-IV mode: the entire EMEID is the ciphertext
    iv = staticIV;
    ciphertext = emeidBuffer;
  } else {
    // Embedded-IV mode: first IV_BYTES bytes are the IV
    if (emeidBuffer.length <= IV_BYTES) {
      throw new Error(
        `EMEID is too short (${emeidBuffer.length} bytes) to contain an embedded ` +
          `${IV_BYTES}-byte IV. Either provide EMEID_AES_IV or use a longer EMEID.`,
      );
    }
    iv = emeidBuffer.subarray(0, IV_BYTES);
    ciphertext = emeidBuffer.subarray(IV_BYTES);
  }

  try {
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (cause) {
    throw new Error(
      "Failed to decrypt EMEID — verify that EMEID_AES_KEY (and EMEID_AES_IV if used) " +
        "match the values configured in Adobe Campaign.",
      { cause },
    );
  }
}

/**
 * Encrypts a plaintext string into an AES-256-CBC EMEID hex string.
 *
 * IV strategy (mirrors decodeEMEID):
 *  - When EMEID_AES_IV is set   → uses that fixed 16-byte IV; returns only
 *    the ciphertext as hex.
 *  - When EMEID_AES_IV is unset → generates a random 16-byte IV, prepends it
 *    to the ciphertext, and returns the combined buffer as hex.
 *
 * @param plaintext  The raw value to encrypt (e.g. an email address).
 * @returns          Hex-encoded EMEID ciphertext (ready for use / testing).
 * @throws           When EMEID_AES_KEY (or EMEID_AES_IV) env vars are missing
 *                   or malformed.
 */
export function encodeEMEID(plaintext: string): string {
  if (typeof plaintext !== "string" || plaintext.length === 0) {
    throw new Error("plaintext must be a non-empty string.");
  }

  const key = getKey();
  const staticIV = getStaticIV();

  let iv: Buffer;
  const useEmbeddedIV = !staticIV;

  if (staticIV) {
    iv = staticIV;
  } else {
    // Generate a random 16-byte IV (embedded-IV mode)
    iv = crypto.randomBytes(IV_BYTES);
  }

  try {
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(plaintext, "utf8")),
      cipher.final(),
    ]);

    if (useEmbeddedIV) {
      // Prepend IV so the receiver can extract it (Adobe Campaign default mode)
      return Buffer.concat([iv, encrypted]).toString("hex");
    } else {
      // Fixed-IV mode: return only the ciphertext
      return encrypted.toString("hex");
    }
  } catch (cause) {
    throw new Error(
      "Failed to encrypt plaintext — verify that EMEID_AES_KEY (and EMEID_AES_IV if used) are correctly set.",
      { cause },
    );
  }
}
