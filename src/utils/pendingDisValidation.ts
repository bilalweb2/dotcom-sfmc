import { z } from "zod";

export const pendingDiscoSchema = z.object({
  consented: z.literal(true, {
    error: "You must agree to the terms and conditions to continue",
  }),
});

export type PendingDiscoFormValues = z.infer<typeof pendingDiscoSchema>;
