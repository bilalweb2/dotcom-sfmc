/**
 * @file utils/unsubscribeValidation.ts
 * @description Zod validation for the simple email-unsubscribe form
 * (UnsubscribePage → POST /ftr-forms/api/UnsubFormProcessing).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Simple unsubscribe (email only)
// ---------------------------------------------------------------------------

export const unsubscribeSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),
});

export type UnsubscribeFormValues = z.infer<typeof unsubscribeSchema>;
