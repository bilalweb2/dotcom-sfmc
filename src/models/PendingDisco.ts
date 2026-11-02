/**
 * @file models/PendingDisco.ts
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
 * | submissionType      | String  | No       | —                            | SFMC submission category       |
 * | FirstName           | String  | No       | —                            | Customer first name; PII       |
 * | LastName            | String  | No       | —                            | Customer last name; PII        |
 * | EmailAddress        | String  | No       | —                            | Normalised lowercase; PII      |
 * | Address             | String  | No       | —                            | Street address; PII            |
 * | City                | String  | No       | —                            | City                           |
 * | State               | String  | No       | —                            | State abbreviation (2 chars)   |
 * | PostalCode          | String  | No       | —                            | US ZIP code                    |
 * | BTN                 | String  | No       | —                            | Billing telephone number; PII  |
 * | EMHID               | String  | No       | —                            | Adobe Campaign parameter       |
 * | EMEID               | String  | No       | —                            | Adobe Campaign parameter       |
 * | CUHID               | String  | No       | —                            | Adobe Campaign parameter       |
 * | CMP                 | String  | No       | —                            | Adobe Campaign campaign code   |
 * | BID                 | String  | No       | —                            | Adobe Campaign batch ID        |
 * | PageName            | String  | No       | 'BAU WHWF - v1'              | Campaign page identifier       |
 * | Offer               | String  | No       | '$0 for 1 month…'            | Offer description              |
 * | ConfirmationCheckBox| Boolean  | No       | 0                            | 1 = confirmed, 0 = not         |
 * | SubmitDate          | Date    | Auto     | now()                        | Injected by Mongoose timestamps|
 *
 * ## Indexes
 * | Name                | Fields                        | Purpose                                    |
 * |---------------------|-------------------------------|--------------------------------------------|
 * | email_1             | { EmailAddress: 1 }           | Fast lookup by email address               |
 * | createdAt_-1        | { createdAt: -1 }             | Time-range queries / newest-first exports  |
 * | postalCode_1        | { PostalCode: 1 }             | Geographic/regional reporting queries      |
 * | email_createdAt     | { EmailAddress:1, createdAt:-1}| Latest record per email (compound)        |
 *
 * ## Unique constraints
 * None — this is an **event-log** collection. A customer may submit the WHWF
 * form multiple times (retry after failure, multiple devices, etc.). Each
 * successful request creates a new document.
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

export interface IPendingDisco extends Document {
  submissionType?: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  Address?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  BTN?: string;
  PageName: string;
  Offer: string;
  ConfirmationCheckBox: boolean;
  SubmitDate: Date;
  /** Adobe Campaign click-tracking parameters (appended to every link) */
  EMHID?: string;
  EMEID?: string;
  CUHID?: string;
  CMP?: string;
  BID?: string;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const PendingDiscoSchema = new Schema<IPendingDisco>(
  {
    submissionType: {
      type: String,
      trim: true,
    },
    FirstName: {
      type: String,
      trim: true,
    },
    LastName: {
      type: String,
      trim: true,
    },
    EmailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    Address: {
      type: String,
      trim: true,
    },
    City: {
      type: String,
      trim: true,
    },
    State: {
      type: String,
      trim: true,
      maxlength: [2, "State must be a 2-character abbreviation"],
    },
    PostalCode: {
      type: String,
      trim: true,
    },
    BTN: {
      type: String,
      trim: true,
    },
    PageName: {
      type: String,
      default: "Save from disconnecting",
      trim: true,
    },
    Offer: {
      type: String,
      default: "2/mo free 500 HSI,then $19/mo",
      trim: true,
    },
    ConfirmationCheckBox: {
      type: Boolean,
      default: false,
    },
    // ── Adobe Campaign click-tracking parameters ──────────────────────────
    /** Hex-encoded AES-256-CBC encrypted subscriber identifier (as received) */
    EMHID: { type: String, trim: true },
    EMEID: { type: String, trim: true },
    /** Contact Unique Hash ID passed by Adobe Campaign */
    CUHID: { type: String, trim: true },
    /** Campaign code (e.g. CRM_R_CU_AC_EM_AAL_26_10_FTR_TEST) */
    CMP: { type: String, trim: true },
    /** Batch ID from Adobe Campaign delivery */
    BID: { type: String, trim: true },
  },
  {
    // createdAt is auto-added; updatedAt is disabled — records are immutable.
    timestamps: { createdAt: "SubmitDate", updatedAt: false },
    collection: "pendingdisco",
  },
);

// ---------------------------------------------------------------------------
// Indexes
// No unique indexes — this is an event-log collection (see file header).
// ---------------------------------------------------------------------------

// Fast email lookup (most common query pattern)
PendingDiscoSchema.index({ EmailAddress: 1 }, { name: "email_1" });

// Time-range queries and data exports (newest first)
PendingDiscoSchema.index({ createdAt: -1 }, { name: "createdAt_-1" });

// Geographic / regional reporting
PendingDiscoSchema.index({ PostalCode: 1 }, { name: "postalCode_1" });

// Compound — "latest WHWF submission for a given email"
PendingDiscoSchema.index(
  { EmailAddress: 1, createdAt: -1 },
  { name: "email_createdAt" },
);

// ---------------------------------------------------------------------------
// Model (singleton-safe for Next.js hot reloads)
// ---------------------------------------------------------------------------
// Replace any model left from a previous hot reload so schema changes apply
// without restarting the dev server.
if (mongoose.models["PendingDisco"]) {
  mongoose.deleteModel("PendingDisco");
}

export const PendingDiscoModel: Model<IPendingDisco> =
  mongoose.model<IPendingDisco>("PendingDisco", PendingDiscoSchema);
