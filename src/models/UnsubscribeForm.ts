/**
 * @file models/UnsubscribeForm.ts
 * @description Mongoose model for the `unsubscribeform` collection (sfmc DB).
 *
 * Maps to the full payload submitted from the email unsubscribe form page.
 *
 * ## Collection
 * Name       : unsubscribeform
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
 * None — this is an **event-log** collection. A subscriber may submit the form
 * multiple times (preference changes, re-subscribes, etc.). Uniqueness is
 * enforced at the application layer when required.
 *
 * ## Timestamps
 * `createdAt` is auto-managed by Mongoose (`timestamps: { createdAt: 'createdAt', updatedAt: false }`).
 * Records are immutable after insertion — there is no `updatedAt`.
 *
 * @example
 * import { UnsubscribeFormModel } from '@/models/UnsubscribeForm';
 * await UnsubscribeFormModel.create({ EmailAddress: 'test@test.co' });
 */

import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUnsubscribeForm extends Document {
  SubmitDate: Date;
  EmailAddress: string;
  /** Adobe Campaign click-tracking parameters (appended to every link) */
  EMEID?: string;
  CUHID?: string;
  CMP?: string;
  BID?: string;
}

// ---------------------------------------------------------------------------
// Main schema
// ---------------------------------------------------------------------------
const UnsubscribeFormSchema = new Schema<IUnsubscribeForm>(
  {
    EmailAddress: {
      type: String,
      required: [true, "EmailAddress is required"],
      trim: true,
      lowercase: true,
    },
    SubmitDate: {
      type: Date,
      default: new Date(),
    },
    // ── Adobe Campaign click-tracking parameters ──────────────────────────
    /** Hex-encoded AES-256-CBC encrypted subscriber identifier (as received) */
    EMEID: { type: String, default: "", trim: true },
    /** Contact Unique Hash ID passed by Adobe Campaign */
    CUHID: { type: String, default: "", trim: true },
    /** Campaign code (e.g. CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST) */
    CMP: { type: String, default: "", trim: true },
    /** Batch ID from Adobe Campaign delivery */
    BID: { type: String, default: "", trim: true },
  },
  {
    // createdAt is auto-added; updatedAt is disabled — records are immutable.
    // timestamps: { createdAt: "createdAt", updatedAt: false },
    collection: "unsubscribe",
  },
);

// ---------------------------------------------------------------------------
// Indexes
// No unique indexes — this is an event-log collection (see file header).
// ---------------------------------------------------------------------------

// Fast email lookup (most common query pattern)
UnsubscribeFormSchema.index({ EmailAddress: 1 }, { name: "email_1" });

// // SFMC cross-reference — filter/join by GBLUID
// UnsubscribeFormSchema.index({ GBLUID: 1 }, { name: "gbluid_1" });

// // Time-range queries and data exports (newest first)
// UnsubscribeFormSchema.index({ SubmitDate: -1 }, { name: "createdAt_-1" });

// Compound — "latest form submission for a given email"
UnsubscribeFormSchema.index(
  { EmailAddress: 1, SubmitDate: -1 },
  { name: "email_createdAt" },
);

// ---------------------------------------------------------------------------
// Model (singleton-safe for Next.js hot reloads)
// ---------------------------------------------------------------------------
export const UnsubscribeFormModel: Model<IUnsubscribeForm> =
  (mongoose.models["UnsubscribeForm"] as Model<IUnsubscribeForm> | undefined) ??
  mongoose.model<IUnsubscribeForm>("UnsubscribeForm", UnsubscribeFormSchema);
