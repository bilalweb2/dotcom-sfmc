import type { NextConfig } from "next";

// CSP is applied per request in src/proxy.ts (nonce-based; required for Next.js hydration).

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block iframe embedding (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter (belt + suspenders alongside CSP)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable access to sensitive browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS — enforce HTTPS for 2 years (only effective in prod behind TLS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Remove server fingerprint
  { key: "X-Powered-By", value: "" },
];

const nextConfig: NextConfig = {
  // Context path prefix for all UI and API routes (configurable via BASE_PATH env var)
  basePath: process.env.BASE_PATH ?? "/ftr-forms",

  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // Keep the Application Insights SDK external to the server bundle
  serverExternalPackages: ["applicationinsights", "newrelic"],

  // Strip X-Powered-By from all responses
  poweredByHeader: false,

  // Custom HTTP headers (security headers applied to every route)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders.filter((h) => h.value !== ""), // skip empties (X-Powered-By handled by poweredByHeader)
      },
    ];
  },

  // Typed routes for safer navigation (Next.js 16+)
  typedRoutes: true,
};

export default nextConfig;
