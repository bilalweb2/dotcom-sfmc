/**
 * @file utils/whwfValidation.ts
 * @description Zod validation for the Whole-Home Wi-Fi upgrade form
 * (WHWFPage → POST /ftr-forms/api/WHWF_Processing).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const whwfSchema = z.object({
  /** User must tick the consent checkbox before submitting */
  consented: z.literal(true, {
    error: "You must agree to the terms and conditions to continue",
  }),
});

export type WHWFFormValues = z.infer<typeof whwfSchema>;
