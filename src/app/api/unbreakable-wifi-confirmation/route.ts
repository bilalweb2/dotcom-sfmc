/**
 * @file app/ftr-forms/api/WHWF_Processing/route.ts
 * @description Whole-Home Wi-Fi form submission handler.
 *
 * Called by: `/WHWF012025` page (WHWFPage component).
 *
 * Accepts the WHWF upgrade form payload, persists it to the `wholehomewifi`
 * collection in the `sfmc` MongoDB database, and returns a fixed OK response
 * that downstream consumers expect.
 *
 * @openapi
 * /ftr-forms/api/WHWF_Processing:
 *   post:
 *     summary: Submit Whole-Home Wi-Fi upgrade form
 *     description: >
 *       Persists a WHWF upgrade submission to MongoDB (`sfmc.wholehomewifi`)
 *       and returns `{ status: "OK", result: "1" }` on success.
 *     tags: [WHWF]
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
 *               GBLUID:
 *                 type: string
 *                 example: ""
 *               BTN:
 *                 type: string
 *                 example: ""
 *               PageName:
 *                 type: string
 *                 default: "BAU WHWF - v1"
 *               Offer:
 *                 type: string
 *                 default: "$0 for 1 month and then $10/mo."
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
 *       503:
 *         description: MongoDB is temporarily unavailable
 */

import { NextResponse, type NextRequest } from "next/server";
import { connectMongoose } from "@/libs/mongoose";
import { UBBWifiModel } from "@/models/UBBWifi";
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

// Max request body: 64 KB
const MAX_BODY_BYTES = 64 * 1024;

// ---------------------------------------------------------------------------
// POST /ftr-forms/api/WHWF_Processing
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

  const gblId = sanitiseString(body["GBLUID"], 100) || "abc123";

  // Sanitise — strip tags, trim, enforce max lengths
  const sanitised = {
    FirstName: sanitiseString(body["FirstName"], 100),
    LastName: sanitiseString(body["LastName"], 100),
    EmailAddress: sanitiseEmail(body["EmailAddress"]),
    Address: sanitiseString(body["Address"], 200),
    City: sanitiseString(body["City"], 100),
    State: sanitiseString(body["State"], 50),
    PostalCode: sanitiseString(body["PostalCode"], 20),
    GBLUID: gblId,
    BTN: sanitiseString(body["BTN"], 20),
    PageName: sanitiseString(body["PageName"], 200) || "BAU WHWF - v1",
    Offer:
      sanitiseString(body["Offer"], 200) || "$0 for 1 month and then $10/mo.",
    ConfirmationCheckBox: Boolean(body["ConfirmationCheckBox"]),
    // Adobe Campaign click-tracking parameters
    EMEID: sanitiseString(body["EMEID"], 500),
    CUHID: sanitiseString(body["CUHID"], 500),
    CMP: sanitiseString(body["CMP"], 200),
    BID: sanitiseString(body["BID"], 100),
  };

  const { cleanedPayload, emptyFields } = cleanPayload(sanitised);

  const updateQuery: Record<string, unknown> = {};

  if (Object.keys(cleanedPayload).length > 0) {
    updateQuery["$set"] = cleanedPayload;
  }

  if (emptyFields.length > 0) {
    updateQuery["$unset"] = Object.fromEntries(
      emptyFields.map((field) => [field, ""]),
    );
  }

  await connectMongoose();

  await UBBWifiModel.findOneAndUpdate({ GBLUID: gblId }, updateQuery, {
    upsert: true,
    returnDocument: "after",
    runValidators: true,
  }).lean();

  // Log with masked PII — never log raw email
  logger.info("UBB submission recorded", {
    email: maskEmail(sanitised.EmailAddress),
    pageName: sanitised.PageName,
    hasCampaignParams: !!(sanitised.EMEID || sanitised.CMP),
  });

  return NextResponse.json({ status: "OK", result: "1" }, { status: 200 });
});
