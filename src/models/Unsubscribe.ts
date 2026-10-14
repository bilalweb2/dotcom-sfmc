/**
 * @file models/Unsubscribe.ts
 * @description Mongoose model for the `unsubscribe` collection (sfmc DB).
 *
 * Maps to the full payload submitted from the email unsubscribe preferences page.
 *
 * ## Collection
 * Name       : unsubscribe
 * Database   : sfmc
 *
 * ## Document structure
 * | Field                          | Type    | Required | Default | Notes                             |
 * |--------------------------------|---------|----------|---------|-----------------------------------|
 * | submissionType                 | String  | No       | ''      | SFMC submission category          |
 * | GBLUID                         | String  | No       | ''      | SFMC global unique ID             |
 * | SubscriberId                   | Number  | No       | 0       | SFMC subscriber ID                |
 * | JobId                          | Number  | No       | 0       | SFMC job ID                       |
 * | ListId                         | Number  | No       | 0       | SFMC list ID                      |
 * | BatchId                        | Number  | No       | 0       | SFMC batch ID                     |
 * | EmailAddress                   | String  | Yes      | —       | Normalised lowercase; PII         |
 * | Preferences                    | Object  | No       | {all:0} | Per-category opt-out flags (0/1)  |
 * | EMEID                          | String  | No       | ''      | Adobe Campaign encrypted email ID  |
 * | EEMID                          | String  | No       | ''      | Adobe Campaign encrypted email member ID |
 * | CUHID                          | String  | No       | ''      | Adobe Campaign contact unique hash |
 * | CMP                            | String  | No       | ''      | Adobe Campaign campaign code       |
 * | BID                            | String  | No       | ''      | Adobe Campaign batch ID            |
 * | createdAt                      | Date    | Auto     | now()   | Injected by Mongoose timestamps   |
 *
 * ## Indexes
 * | Name                  | Fields                        | Purpose                                    |
 * |-----------------------|-------------------------------|--------------------------------------------|
 * | email_1               | { EmailAddress: 1 }           | Fast lookup by email address               |
 * | gbluid_1              | { GBLUID: 1 }                 | SFMC cross-reference lookup                |
 * | createdAt_-1          | { createdAt: -1 }             | Time-range queries / newest-first exports  |
 * | email_createdAt       | { EmailAddress:1, createdAt:-1} | Latest record per email (compound)       |
 *
 * ## Unique constraints
 * None — this is an **event-log** collection. A subscriber may unsubscribe
 * multiple times (preference changes, re-subscribes, etc.). Uniqueness is
 * enforced at the application layer when required.
 *
 * ## Timestamps
 * `createdAt` is auto-managed by Mongoose (`timestamps: { createdAt: 'createdAt', updatedAt: false }`).
 * Records are immutable after insertion — there is no `updatedAt`.
 *
 * @example
 * import { UnsubscribeModel } from '@/models/Unsubscribe';
 * await UnsubscribeModel.create({ EmailAddress: 'test@test.co' });
 */

import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUnsubscribe extends Document {
  GBLUID: string;
  EmailAddress: string;
  unsubscribedtoAddedProtection: boolean;
  unsubscribedtoHelpfulTips: boolean;
  unsubscribedtoInternetUpgrades: boolean;
  unsubscribedtoNewProducts: boolean;
  unsubscribedtoNewsletters: boolean;
  unsubscribedtoReferaFriend: boolean;
  unsubscribedtoRewards: boolean;
  unsubscribedtoSpecialOffers: boolean;
  unsubscribedtoWiFiEnhancements: boolean;
  unsubscribedtoYouTubeTV: boolean;
  Unsubscribed: boolean;
  createdAt: Date;
  /** Adobe Campaign click-tracking parameters (appended to every link) */
  EMEID?: string;
  /** Encrypted Email Member ID passed by Adobe Campaign */
  EEMID?: string;
  CUHID?: string;
  CMP?: string;
  BID?: string;
}

// ---------------------------------------------------------------------------
// Main schema
// ---------------------------------------------------------------------------
const UnsubscribeSchema = new Schema<IUnsubscribe>(
  {
    GBLUID: {
      type: String,
      default: "",
      trim: true,
    },
    EmailAddress: {
      type: String,
      required: [true, "EmailAddress is required"],
      trim: true,
      lowercase: true,
    },
    unsubscribedtoAddedProtection: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoHelpfulTips: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoInternetUpgrades: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoNewProducts: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoNewsletters: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoReferaFriend: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoRewards: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoSpecialOffers: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoWiFiEnhancements: {
      type: Boolean,
      default: false,
      trim: true,
    },
    unsubscribedtoYouTubeTV: {
      type: Boolean,
      default: false,
      trim: true,
    },
    Unsubscribed: {
      type: Boolean,
      default: false,
      trim: true,
    },
    // ── Adobe Campaign click-tracking parameters ──────────────────────────
    /** Hex-encoded AES-256-CBC encrypted subscriber identifier (as received) */
    EMEID: { type: String, default: "", trim: true },
    /** Encrypted Email Member ID passed by Adobe Campaign */
    EEMID: { type: String, default: "", trim: true },
    /** Contact Unique Hash ID passed by Adobe Campaign */
    CUHID: { type: String, default: "", trim: true },
    /** Campaign code (e.g. CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST) */
    CMP: { type: String, default: "", trim: true },
    /** Batch ID from Adobe Campaign delivery */
    BID: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: true },
    collection: "unsubscribe_preferences",
  },
);

// ---------------------------------------------------------------------------
// Indexes
// No unique indexes — this is an event-log collection (see file header).
// ---------------------------------------------------------------------------

// Fast email lookup (most common query pattern)
UnsubscribeSchema.index({ EmailAddress: 1 }, { name: "email_1" });

// SFMC cross-reference — filter/join by GBLUID
UnsubscribeSchema.index({ GBLUID: 1 }, { name: "gbluid_1" });

// Time-range queries and data exports (newest first)
UnsubscribeSchema.index({ createdAt: -1 }, { name: "createdAt_-1" });

// Compound — "latest unsubscribe record for a given email"
UnsubscribeSchema.index(
  { EmailAddress: 1, createdAt: -1 },
  { name: "email_createdAt" },
);

// ---------------------------------------------------------------------------
// Model (singleton-safe for Next.js hot reloads)
// ---------------------------------------------------------------------------
export const UnsubscribeModel: Model<IUnsubscribe> =
  (mongoose.models["Unsubscribe"] as Model<IUnsubscribe> | undefined) ??
  mongoose.model<IUnsubscribe>("Unsubscribe", UnsubscribeSchema);
