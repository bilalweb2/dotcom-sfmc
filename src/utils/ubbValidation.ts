/**
 * @file utils/ubbValidation.ts
 * @description Zod validation for the Whole-Home Wi-Fi upgrade form
 * (UBBPage → POST /ftr-forms/api/unbreakable-wifi-confirmation).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const UbbSchema = z.object({
  /** User must tick the consent checkbox before submitting */
  consented: z.literal(true, {
    error: "You must agree to the terms and conditions to continue",
  }),
});

export type UBBFormValues = z.infer<typeof UbbSchema>;
