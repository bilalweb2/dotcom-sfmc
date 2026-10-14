/**
 * @file logger.ts
 * @description Centralised application logger.
 *
 * In development: pretty-prints to the console.
 * In production:  you can swap the transport to a service like Datadog / Sentry.
 *
 * ## PII Policy
 * Never log raw email addresses, phone numbers, or MongoDB credentials.
 * Use `maskEmail()` / `maskPhone()` before including PII in log metadata.
 *
 * Usage:
 *   import logger, { maskEmail } from '@/logger';
 *   logger.info('Server started', { port: 3000 });
 *   logger.info('User action', { email: maskEmail(userEmail) });
 *   logger.error('DB connection failed', { error });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: LogMeta;
}

// ---------------------------------------------------------------------------
// PII masking helpers (exported for use in routes)
// ---------------------------------------------------------------------------

/**
 * Masks an email address so only the domain and the first character of the
 * local part are visible: "jane.doe@example.com" → "j***@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "[no email]";
  const atIdx = email.indexOf("@");
  if (atIdx <= 0) return "***@[unknown]";
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  return `${local[0]}${"*".repeat(Math.min(local.length - 1, 5))}${domain}`;
}

/**
 * Masks a phone number — keeps last 4 digits: "5551234567" → "***-***-4567"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "[no phone]";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `***-***-${digits.slice(-4)}`;
}

/**
 * Scrubs known sensitive keys from a meta object before logging.
 * Extend this list as needed.
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "api_key",
  "apiKey",
  "credential",
  "mongodb_uri",
  "MONGODB_URI",
]);

function redactMeta(meta: LogMeta | undefined): LogMeta | undefined {
  if (!meta) return undefined;
  const safe: LogMeta = {};
  for (const [k, v] of Object.entries(meta)) {
    safe[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v;
  }
  return safe;
}

// ---------------------------------------------------------------------------
// Transport (swap this in production)
// ---------------------------------------------------------------------------
function transport(entry: LogEntry): void {
  const { level, message, timestamp, meta } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const safeMeta = redactMeta(meta);

  if (level === "error") {
    console.error(prefix, message, safeMeta ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, safeMeta ?? "");
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, message, safeMeta ?? "");
  }
}

// ---------------------------------------------------------------------------
// Logger factory
// ---------------------------------------------------------------------------
function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: LogMeta,
): LogEntry {
  return { level, message, timestamp: new Date().toISOString(), meta };
}

const logger = {
  debug: (message: string, meta?: LogMeta) =>
    transport(createLogEntry("debug", message, meta)),
  info: (message: string, meta?: LogMeta) =>
    transport(createLogEntry("info", message, meta)),
  warn: (message: string, meta?: LogMeta) =>
    transport(createLogEntry("warn", message, meta)),
  error: (message: string, meta?: LogMeta) =>
    transport(createLogEntry("error", message, meta)),
};

export default logger;
