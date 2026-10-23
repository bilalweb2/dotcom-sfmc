/**
 * @file models/UBBWifi.ts
 * @description Mongoose model for the `wholehomewifi` collection (sfmc DB).
 *
 * Maps to the payload submitted from the Whole-Home Wi-Fi upgrade page.
 *
 * ## Collection
 * Name       : wholehomewifi
 * Database   : sfmc
 *
 * ## Document structure
 * | Field               | Type    | Required | Default                      | Notes                          |
 * |---------------------|---------|----------|------------------------------|--------------------------------|
 * | submissionType      | String  | No       | ''                           | SFMC submission category       |
 * | FirstName           | String  | No       | ''                           | Customer first name; PII       |
 * | LastName            | String  | No       | ''                           | Customer last name; PII        |
 * | EmailAddress        | String  | No       | ''                           | Normalised lowercase; PII      |
 * | Address             | String  | No       | ''                           | Street address; PII            |
 * | City                | String  | No       | ''                           | City                           |
 * | State               | String  | No       | ''                           | State abbreviation (2 chars)   |
 * | PostalCode          | String  | No       | ''                           | US ZIP code                    |
 * | GBLUID              | String  | No       | ''                           | SFMC global unique ID          |
 * | BTN                 | String  | No       | ''                           | Billing telephone number; PII  |
 * | PageName            | String  | No       | 'BAU WHWF - v1'              | Campaign page identifier       |
 * | Offer               | String  | No       | '$0 for 1 month…'            | Offer description              |
 * | ConfirmationCheckBox| Boolean  | No       | 0                            | 1 = confirmed, 0 = not         |
 * | createdAt           | Date    | Auto     | now()                        | Injected by Mongoose timestamps|
 *
 * ## Indexes
 * | Name                | Fields                        | Purpose                                    |
 * |---------------------|-------------------------------|--------------------------------------------|
 * | email_1             | { EmailAddress: 1 }           | Fast lookup by email address               |
 * | gbluid_1            | { GBLUID: 1 }                 | SFMC cross-reference lookup                |
 * | createdAt_-1        | { createdAt: -1 }             | Time-range queries / newest-first exports  |
 * | postalCode_1        | { PostalCode: 1 }             | Geographic/regional reporting queries      |
 * | email_createdAt     | { EmailAddress:1, createdAt:-1}| Latest record per email (compound)        |
 *
 * ## Unique constraints
 * None — this is an **event-log** collection. A customer may submit the WHWF
 * form multiple times (retry after failure, multiple devices, etc.). Uniqueness
 * is enforced at the application layer when required.
 *
 * ## Timestamps
 * `createdAt` is auto-managed by Mongoose (`timestamps: { createdAt: 'createdAt', updatedAt: false }`).
 * Records are immutable after insertion — there is no `updatedAt`.
 *
 * @example
 * import { WholeHomeWifiModel } from '@/models/WholeHomeWifi';
 * await WholeHomeWifiModel.create({ FirstName: 'Jane', LastName: 'Doe', EmailAddress: 'jane@example.com' });
 */

import mongoose, { type Document, type Model, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// Type contract
// ---------------------------------------------------------------------------

export interface IUBBWifi extends Document {
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  Address: string;
  City: string;
  State: string;
  PostalCode: string;
  GBLUID: string;
  BTN: string;
  PageName: string;
  Offer: string;
  ConfirmationCheckBox: boolean;
  SubmitDate: Date;
  /** Adobe Campaign click-tracking parameters (appended to every link) */
  EMEID?: string;
  CUHID?: string;
  CMP?: string;
  BID?: string;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const UBBWifiSchema = new Schema<IUBBWifi>(
  {
    FirstName: {
      type: String,
      default: "",
      trim: true,
    },
    LastName: {
      type: String,
      default: "",
      trim: true,
    },
    EmailAddress: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    Address: {
      type: String,
      default: "",
      trim: true,
    },
    City: {
      type: String,
      default: "",
      trim: true,
    },
    State: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2, "State must be a 2-character abbreviation"],
    },
    PostalCode: {
      type: String,
      default: "",
      trim: true,
    },
    GBLUID: {
      type: String,
      default: "",
      trim: true,
    },
    BTN: {
      type: String,
      default: "",
      trim: true,
    },
    PageName: {
      type: String,
      default: "UBB-Connected Living",
      trim: true,
    },
    Offer: {
      type: String,
      default: "Unbreakable $25/mo",
      trim: true,
    },
    ConfirmationCheckBox: {
      type: Boolean,
      default: false,
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
    timestamps: { createdAt: "SubmitDate", updatedAt: false },
    collection: "ubbwifi",
  },
);

// ---------------------------------------------------------------------------
// Indexes
// No unique indexes — this is an event-log collection (see file header).
// ---------------------------------------------------------------------------

// Fast email lookup (most common query pattern)
UBBWifiSchema.index({ EmailAddress: 1 }, { name: "email_1" });

// SFMC cross-reference — filter/join by GBLUID
UBBWifiSchema.index({ GBLUID: 1 }, { name: "gbluid_1" });

// Time-range queries and data exports (newest first)
UBBWifiSchema.index({ createdAt: -1 }, { name: "createdAt_-1" });

// Geographic / regional reporting
UBBWifiSchema.index({ PostalCode: 1 }, { name: "postalCode_1" });

// Compound — "latest WHWF submission for a given email"
UBBWifiSchema.index(
  { EmailAddress: 1, createdAt: -1 },
  { name: "email_createdAt" },
);

// ---------------------------------------------------------------------------
// Model (singleton-safe for Next.js hot reloads)
// ---------------------------------------------------------------------------
// Replace any model left from a previous hot reload so schema changes apply
// without restarting the dev server.
if (mongoose.models["UBBWifi"]) {
  mongoose.deleteModel("UBBWifi");
}

export const UBBWifiModel: Model<IUBBWifi> = mongoose.model<IUBBWifi>(
  "UBBWifi",
  UBBWifiSchema,
);
