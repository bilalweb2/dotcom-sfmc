/**
 * @file constants/index.ts
 * @description Global application constants.
 */

export const APP_NAME = "SFMC";
export const APP_VERSION = "0.1.0";

/** HTTP status codes (named for readability) */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Runtime base path — driven by the BASE_PATH env var (same value used by
 * next.config.ts).  The NEXT_PUBLIC_ prefix makes it available in client
 * bundles; falls back to "/ftr-forms" to match the default basePath.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_APP_URL ?? "/ftr-forms";

/** API route paths — constructed dynamically so they always honour BASE_PATH */
export const API_ROUTES = {
  HEALTH: `${BASE_PATH}/api/health`,
  UNSUB_FORM: `${BASE_PATH}/api/UnsubFormProcessing`,
  UNSUB_PREFERENCES: `${BASE_PATH}/api/Unsubscribe-Form-Processing`,
  WHWF_PROCESSING: `${BASE_PATH}/api/WHWF_Processing`,
  DECODE_EMEID: `${BASE_PATH}/api/DecodeEMEID`,
  DISCONNECTING_PROCESSING: `${BASE_PATH}/api/disconnecting-processing`,
  UBB_PROCESSING: `${BASE_PATH}/api/unbreakable-wifi-confirmation`,
};
