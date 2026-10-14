/**
 * @file utils/unsubscribePreferencesValidation.ts
 * @description Zod validation for the full unsubscribe-preferences form
 * (UnsubscribePreferencesPage → POST /ftr-forms/api/Unsubscribe-Form-Processing).
 *
 * At least one preference checkbox must be selected before the user can submit.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const unsubscribePreferencesSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address")
      .max(254, "Email address is too long"),

    // Per-category preference flags
    unsubscribedtoAddedProtection: z.boolean(),
    unsubscribedtoHelpfulTips: z.boolean(),
    unsubscribedtoInternetUpgrades: z.boolean(),
    unsubscribedtoNewProducts: z.boolean(),
    unsubscribedtoNewsletters: z.boolean(),
    unsubscribedtoReferaFriend: z.boolean(),
    unsubscribedtoRewards: z.boolean(),
    unsubscribedtoSpecialOffers: z.boolean(),
    unsubscribedtoWiFiEnhancements: z.boolean(),
    unsubscribedtoYouTubeTV: z.boolean(),

    // "Unsubscribe from All" master toggle — derived, but still part of the payload
    Unsubscribed: z.boolean(),
  })
  .refine(
    (data) =>
      data.unsubscribedtoAddedProtection ||
      data.unsubscribedtoHelpfulTips ||
      data.unsubscribedtoInternetUpgrades ||
      data.unsubscribedtoNewProducts ||
      data.unsubscribedtoNewsletters ||
      data.unsubscribedtoReferaFriend ||
      data.unsubscribedtoRewards ||
      data.unsubscribedtoSpecialOffers ||
      data.unsubscribedtoWiFiEnhancements ||
      data.unsubscribedtoYouTubeTV,
    {
      message: "Please select at least one email category to unsubscribe from",
      path: ["Unsubscribed"],
    },
  );

export type UnsubscribePreferencesFormValues = z.infer<
  typeof unsubscribePreferencesSchema
>;

// ---------------------------------------------------------------------------
// Default values — categories start unchecked, matching the live preference center.
// ---------------------------------------------------------------------------

export const unsubscribePreferencesDefaultValues: UnsubscribePreferencesFormValues =
  {
    email: "",
    unsubscribedtoAddedProtection: false,
    unsubscribedtoHelpfulTips: false,
    unsubscribedtoInternetUpgrades: false,
    unsubscribedtoNewProducts: false,
    unsubscribedtoNewsletters: false,
    unsubscribedtoReferaFriend: false,
    unsubscribedtoRewards: false,
    unsubscribedtoSpecialOffers: false,
    unsubscribedtoWiFiEnhancements: false,
    unsubscribedtoYouTubeTV: false,
    Unsubscribed: false,
  };
