/**
 * @file utils/campaignParams.ts
 * @description Reads and sanitises Adobe Campaign parameters used by form pages.
 */

import { sanitiseString } from "@/utils/validation";

export const CAMPAIGN_PARAM_LIMITS = {
  EMHID: 500,
  EMEID: 500,
  CUHID: 500,
  CMP: 200,
  BID: 100,
} as const;

export type CampaignParamName = keyof typeof CAMPAIGN_PARAM_LIMITS;
export type CampaignParams = Partial<Record<CampaignParamName, string>>;

const CAMPAIGN_PARAM_NAMES = Object.keys(
  CAMPAIGN_PARAM_LIMITS,
) as CampaignParamName[];

export function readCampaignParams(
  searchParams: Pick<URLSearchParams, "get">,
): CampaignParams {
  const params: CampaignParams = {};

  for (const name of CAMPAIGN_PARAM_NAMES) {
    const value = searchParams.get(name);
    if (value) params[name] = value;
  }

  return params;
}

export function sanitiseCampaignParams(
  body: Record<string, unknown>,
): CampaignParams {
  const params: CampaignParams = {};

  for (const name of CAMPAIGN_PARAM_NAMES) {
    const value = sanitiseString(body[name], CAMPAIGN_PARAM_LIMITS[name]);
    if (value) params[name] = value;
  }

  return params;
}
