/**
 * @file proxy.ts
 * @description Next.js Proxy — runs before every matched request.
 *
 * Current responsibilities:
 *  - Unique X-Request-Id tracing header
 *  - Auth token guard for private API routes
 *  - Global rate-limit guard (IP-based, 60 req/min per route)
 *  - CORS preflight passthrough
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { NextResponse, type NextRequest } from "next/server";
import logger from "@/logger";
import { logApiExchange } from "@/utils/apiLog";
import {
  buildContentSecurityPolicy,
  createCspNonce,
  CSP_NONCE_HEADER,
} from "@/utils/contentSecurityPolicy";

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/**
 * Runtime base path — must match the `basePath` value in next.config.ts.
 * Driven by the BASE_PATH env var; defaults to "/ftr-forms".
 */
const BASE_PATH = process.env.BASE_PATH ?? "/ftr-forms";
const API_PREFIX = `${BASE_PATH}/api`;

// Routes that do NOT require a Bearer token
const PUBLIC_PATHS = [
  "/",
  `${API_PREFIX}/health`,
  `${API_PREFIX}/WHWF_Processing`,
  `${API_PREFIX}/UnsubFormProcessing`,
  `${API_PREFIX}/Unsubscribe-Form-Processing`,
  `${API_PREFIX}/DecodeEMEID`,
  `${API_PREFIX}/disconnecting-processing`,
  `${API_PREFIX}/unbreakable-wifi-confirmation`,
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// ---------------------------------------------------------------------------
// In-proxy rate limiter (lightweight — per-IP global cap)
// ---------------------------------------------------------------------------

interface IpEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, IpEntry>();
const GLOBAL_LIMIT = 120; // requests per IP per window
const GLOBAL_WINDOW_MS = 60_000; // 1 minute

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0]!.trim() : "unknown";
}

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    ipStore.set(ip, { count: 1, resetAt: now + GLOBAL_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > GLOBAL_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false, retryAfter: 0 };
}

// ---------------------------------------------------------------------------
// CSP + forwarded request headers (Next.js reads nonce from CSP on the request)
// ---------------------------------------------------------------------------

function createCspContext(request: NextRequest) {
  const nonce = createCspNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSP_NONCE_HEADER, nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  return { contentSecurityPolicy, requestHeaders };
}

function applyCspAndRequestId(
  response: NextResponse,
  contentSecurityPolicy: string,
  requestId: string,
): NextResponse {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("X-Request-Id", requestId);
  return response;
}

// ---------------------------------------------------------------------------
// Proxy handler
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Attach a unique request ID for distributed tracing
  const requestId = crypto.randomUUID();
  const { contentSecurityPolicy, requestHeaders } = createCspContext(request);

  // ── Allow OPTIONS (preflight) through immediately ─────────────────────────
  if (method === "OPTIONS") {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return applyCspAndRequestId(res, contentSecurityPolicy, requestId);
  }

  // ── Global IP rate limit ──────────────────────────────────────────────────
  const ip = getClientIp(request);
  const { limited, retryAfter } = isRateLimited(ip);

  if (limited) {
    logger.warn("Global rate limit exceeded in proxy", { ip, path: pathname });
    const body = {
      error: "Too Many Requests",
      retryAfter,
      timestamp: new Date().toISOString(),
    };
    if (pathname.startsWith(`${API_PREFIX}/`)) {
      void logApiExchange({
        method,
        path: pathname,
        query: request.nextUrl.search,
        status: 429,
        durationMs: 0,
        requestBody: "",
        responseBody: JSON.stringify(body),
        requestId,
      });
    }
    return applyCspAndRequestId(
      new NextResponse(JSON.stringify(body), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }),
      contentSecurityPolicy,
      requestId,
    );
  }

  // ── Auth guard for private API routes ─────────────────────────────────────
  if (!isPublicPath(pathname) && pathname.startsWith(`${API_PREFIX}/`)) {
    const token = request.headers.get("Authorization");
    if (!token?.startsWith("Bearer ")) {
      logger.warn("Unauthorized API access", { path: pathname, ip });
      const body = {
        error: "Unauthorized",
        timestamp: new Date().toISOString(),
      };
      void logApiExchange({
        method,
        path: pathname,
        query: request.nextUrl.search,
        status: 401,
        durationMs: 0,
        requestBody: "",
        responseBody: JSON.stringify(body),
        requestId,
      });
      return applyCspAndRequestId(
        NextResponse.json(body, { status: 401 }),
        contentSecurityPolicy,
        requestId,
      );
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return applyCspAndRequestId(response, contentSecurityPolicy, requestId);
}

export const config = {
  /** Run proxy on all routes except Next.js internals and static files */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
