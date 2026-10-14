/**
 * @file utils/emeidValidation.ts
 * @description Zod schema for validating the DecodeEMEID API query parameters.
 *
 * Both EMEID and CUHID are encoded strings appended by Adobe Campaign to
 * every tracked link click.  EMEID is required; CUHID is optional and is
 * passed through for logging purposes.
 *
 * Accepted encodings:
 *  - Hex   — even-length string of [0-9a-fA-F] characters
 *  - Base64 — length divisible by 4, characters [A-Za-z0-9+/=]
 */

import { z } from "zod";

/**
 * Accepts a non-empty string that is either a valid hex or Base64 encoding.
 *
 * Hex:    even number of [0-9a-fA-F] characters (e.g. "bd571ecf…")
 * Base64: length % 4 === 0, characters [A-Za-z0-9+/] with optional '=' padding
 *         (e.g. "vVcez3yM9M3nm8l+PtOxqg==")
 */
const encodedString = z
  .string()
  .min(1, "Must be a non-empty string")
  .refine(
    (v) => {
      // Hex: only hex chars, even length
      if (/^[0-9a-fA-F]+$/.test(v) && v.length % 2 === 0) return true;
      // Base64: standard alphabet + padding, length divisible by 4
      if (/^[A-Za-z0-9+/]+=*$/.test(v) && v.length % 4 === 0) return true;
      return false;
    },
    {
      message:
        "Must be a valid hex string (even-length, 0-9 a-f) or Base64 string (length ÷ 4, A-Za-z0-9+/=)",
    },
  );

export const DecodeEMEIDSchema = z.object({
  /** AES-256-CBC encrypted email / subscriber ID — hex or Base64 encoded. */
  EMEID: encodedString,

  /** Contact Unique Hash ID — optional; logged but not processed. */
  CUHID: encodedString.optional(),
});

export type DecodeEMEIDInput = z.infer<typeof DecodeEMEIDSchema>;
