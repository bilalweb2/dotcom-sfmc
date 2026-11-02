/**
 * @file app/api/disconnecting-processing/route.ts
 * @description PendingDiscoPage form submission handler.
 *
 * Called by: `/pendingdisco-LP` page (PendingDisPage component).
 *
 * Accepts the PendingDisco upgrade form payload, persists it to the `PendingDisco-LP`
 * collection in the `sfmc` MongoDB database, and returns a fixed OK response
 * that downstream consumers expect.
 *
 * @openapi
 *  /ftr-forms/api/disconnecting_Processing:
 *   post:
 *     summary: Submit Pending Disco upgrade form
 *     description: >
 *       Persists a PendingDisco upgrade submission to MongoDB (`sfmc.wholehomewifi`)
 *       and returns `{ status: "OK", result: "1" }` on success.
 *     tags: [PendingDisco]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionType:
 *                 type: string
 *                 example: ""
 *               FirstName:
 *                 type: string
 *                 example: "Jane"
 *               LastName:
 *                 type: string
 *                 example: "Doe"
 *               EmailAddress:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               Address:
 *                 type: string
 *                 example: "123 Main St"
 *               City:
 *                 type: string
 *                 example: "Dallas"
 *               State:
 *                 type: string
 *                 example: "TX"
 *               PostalCode:
 *                 type: string
 *                 example: "75201"
 *               EMHID:
 *                 type: string
 *                 example: "881b88812e0c7e2354153d8a7f967651"
 *               EMEID:
 *                 type: string
 *                 example: ""
 *               CUHID:
 *                 type: string
 *                 example: "a507ff5de160d68671e56e343762c39d"
 *               CMP:
 *                 type: string
 *                 example: "CRM_R_CU_AC_EM_UPG_99_99_HOME_WIFI"
 *               BID:
 *                 type: string
 *                 example: "1002031004"
 *               BTN:
 *                 type: string
 *                 example: ""
 *               PageName:
 *                 type: string
 *                 default: "Save from disconnecting"
 *               Offer:
 *                 type: string
 *                 default: "2/mo free 500 HSI,then $19/mo"
 *               ConfirmationCheckBox:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 1
 *     responses:
 *       200:
 *         description: Submission recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 result:
 *                   type: string
 *                   example: "1"
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

import { NextResponse, type NextRequest } from "next/server";
import { connectMongoose } from "@/libs/mongoose";
import { PendingDiscoModel } from "@/models/PendingDisco";
import { withErrorHandler } from "@/utils/withErrorHandler";
import {
  getMissingFields,
  sanitiseEmail,
  sanitiseString,
  isWithinSizeLimit,
} from "@/utils/validation";
import { maskEmail } from "@/logger";
import logger from "@/logger";
import { cleanPayload } from "@/utils/cleanPayload";
import { sanitiseCampaignParams } from "@/utils/campaignParams";

// Max request body: 64 KB
const MAX_BODY_BYTES = 64 * 1024;

// ---------------------------------------------------------------------------
// POST /ftr-forms/api/disconnecting-processing
// ---------------------------------------------------------------------------
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Body size guard
  if (!isWithinSizeLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json(
      { error: "Payload too large", timestamp: new Date().toISOString() },
      { status: 413 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  // Validate required fields
  const required = [] as const;
  const missing = getMissingFields(body as Record<string, unknown>, [
    ...required,
  ]);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: missing.map((f) => `${f} is required`),
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
  // Sanitise — strip tags, trim, enforce max lengths
  const sanitised = {
    submissionType: sanitiseString(body["submissionType"], 100),
    FirstName: sanitiseString(body["FirstName"], 100),
    LastName: sanitiseString(body["LastName"], 100),
    EmailAddress: sanitiseEmail(body["EmailAddress"]),
    Address: sanitiseString(body["Address"], 200),
    City: sanitiseString(body["City"], 100),
    State: sanitiseString(body["State"], 50),
    PostalCode: sanitiseString(body["PostalCode"], 20),
    BTN: sanitiseString(body["BTN"], 20),
    PageName:
      sanitiseString(body["PageName"], 200) || "Save from disconnecting",
    Offer:
      sanitiseString(body["Offer"], 200) || "2/mo free 500 HSI,then $19/mo",
    ConfirmationCheckBox: Boolean(body["ConfirmationCheckBox"]),
  };
  const { cleanedPayload } = cleanPayload(sanitised);
  const campaignParams = sanitiseCampaignParams(body);

  // Persist to MongoDB
  await connectMongoose();
  await PendingDiscoModel.create({ ...cleanedPayload, ...campaignParams });

  // Log with masked PII — never log raw email
  logger.info("PendingDisco-LP submission recorded", {
    email: maskEmail(sanitised.EmailAddress),
    pageName: sanitised.PageName,
    hasCampaignParams: Object.keys(campaignParams).length > 0,
  });

  return NextResponse.json({ status: "OK", result: "1" }, { status: 200 });
});
