/**
 * @file utils/validation.ts
 * @description Lightweight request body validation and sanitisation helpers.
 * Form-level Zod rules live in the sibling *Validation.ts files.
 */

// ---------------------------------------------------------------------------
// Field presence
// ---------------------------------------------------------------------------

/** Returns the list of required keys that are absent / empty in the body */
export function getMissingFields(
  body: Record<string, unknown>,
  required: string[],
): string[] {
  return required.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === "",
  );
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/** Type-guard: checks if the value is a non-empty string */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sanitise a free-form string:
 *  - Trim surrounding whitespace
 *  - Strip HTML/script tags to prevent stored-XSS
 *  - Enforce an optional maximum length
 */
export function sanitiseString(value: unknown, maxLength = 500): string {
  if (!isNonEmptyString(value)) return "";
  return value
    .trim()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .slice(0, maxLength);
}

/**
 * Sanitise and normalise an email address:
 *  - Lower-case
 *  - Trim whitespace
 *  - Strip tags
 *  - Enforce max length (RFC 5321: 254 chars)
 */
export function sanitiseEmail(value: unknown): string {
  if (!isNonEmptyString(value)) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .slice(0, 254);
}

// ---------------------------------------------------------------------------
// Format validators
// ---------------------------------------------------------------------------

/** RFC 5322-inspired email regex — rejects obvious injections */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/** Returns true when the value is a structurally valid email address */
export function isValidEmail(value: unknown): boolean {
  return (
    isNonEmptyString(value) &&
    EMAIL_RE.test(value.trim()) &&
    value.trim().length <= 254
  );
}

/** Returns true when the value is a string containing only digits (no sign) */
export function isNumericString(value: unknown): boolean {
  return isNonEmptyString(value) && /^\d+$/.test(value.trim());
}

// ---------------------------------------------------------------------------
// Integer coercion (safe — never NaN)
// ---------------------------------------------------------------------------

/** Parse a string-or-null to an integer; falls back to `fallback` (default 0) */
export function toSafeInt(
  value: string | null | undefined,
  fallback = 0,
): number {
  const parsed = parseInt(value ?? "", 10);
  return isNaN(parsed) ? fallback : parsed;
}

// ---------------------------------------------------------------------------
// Request body size guard
// ---------------------------------------------------------------------------

/**
 * Checks that the request Content-Length header does not exceed `maxBytes`.
 * Returns true if the request is within limit (or if no Content-Length sent).
 */
export function isWithinSizeLimit(
  request: { headers: { get(k: string): string | null } },
  maxBytes: number,
): boolean {
  const cl = request.headers.get("content-length");
  if (!cl) return true; // streaming or chunked — handled by body read
  return parseInt(cl, 10) <= maxBytes;
}
