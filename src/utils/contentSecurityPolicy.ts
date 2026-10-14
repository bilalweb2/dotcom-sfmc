/**
 * @file utils/contentSecurityPolicy.ts
 * @description Builds per-request Content-Security-Policy values for use in proxy.ts.
 * Nonces allow Next.js inline bootstrap scripts in production while keeping a strict CSP.
 */

/** Request header carrying the nonce for Next.js server rendering */
export const CSP_NONCE_HEADER = "x-nonce";

/**
 * Creates a cryptographically random nonce suitable for CSP `script-src`.
 */
export function createCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Builds a Content-Security-Policy header value for the given nonce.
 * @see https://nextjs.org/docs/app/guides/content-security-policy
 */
export function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // No nonce on style-src: when a nonce/hash is present, browsers ignore
    // 'unsafe-inline', which blocks React inline styles and element.style updates.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}
