# Production Readiness Checklist

Cross-check of the repository as of 2026-10-14. This checklist distinguishes
controls visible in source from deployment controls that require verification
in the production environment. Do not put secret values in this document.

## Release gates

- [ ] **BLOCKER — Stop baking secrets into container images.** `Dockerfile`
  accepts credentials as `ARG` and copies them into `ENV` in both build and
  runtime stages. Docker image configuration and build layers can expose
  values. Supply runtime secrets through the platform's secret store; use
  BuildKit secret mounts only for secrets genuinely needed at build time.
- [ ] **BLOCKER — Exclude local files from the Docker build context.** No
  `.dockerignore` is present, while the Dockerfile uses `COPY . .`. Add
  exclusions for `.env*`, `.git`, `node_modules`, `.next`, coverage output,
  and other local-only files. `.gitignore` does not define Docker build-context
  exclusions.
- [ ] **BLOCKER — Confirm and enforce API authentication.** `API_SECRET` is
  documented and configured in Terraform, but no application code reads it.
  The proxy classifies the form-processing and decode APIs as public; its
  remaining bearer-token check verifies the authorization scheme but not
  whether the credential is valid. Explicitly document which endpoints must
  be public for campaign traffic and implement actual credential verification
  for endpoints that are private.
  Evidence: `src/proxy.ts`, `src/types/env.d.ts`, `README.md`,
  `terraform/nonprodv2/main.tf`.
- [ ] **BLOCKER — Redact personal data from API audit logs.** The route wrapper
  records request and response bodies; `sanitizeBody` redacts secret-like keys
  but does not mask email fields such as `EmailAddress`. Audit logs are sent to
  MongoDB and optionally Azure and New Relic. Mask or omit PII before every
  sink, then set and verify retention, access, and deletion controls.
  Evidence: `src/utils/withErrorHandler.ts`, `src/utils/apiLog.ts`,
  `src/logger.ts`.

## Application and platform readiness

- [x] **Production build succeeds.** `npm run build` completed successfully
  with Next.js 16.3.6 and Turbopack during this repository review.
- [x] **Automated quality scripts exist.** `package.json` defines lint,
  formatting, type-check, test, dependency-audit, build, and combined quality
  scripts. The combined `quality` script does not itself run the production
  build or dependency audit; run those as separate release gates.
- [ ] **Add or verify CI/CD gates.** No repository GitHub Actions workflow was
  found. Verify the actual external pipeline runs `npm ci`, `npm run quality`,
  `npm run audit`, and `npm run build`, and records results for the exact
  artifact being deployed. The README describes a Husky pre-push hook, but a
  checked-in `.husky/pre-push` script was not found; do not rely on that hook
  as the release gate.
- [ ] **Use a least-privilege container user.** The runtime stage in
  `Dockerfile` does not set a non-root `USER`. Configure and verify a
  non-privileged runtime user and confirm it can read the required app files.
- [ ] **Use production deployment configuration.** The repository contains
  `terraform/sandbox` and `terraform/nonprodv2`, but no clearly identified
  SFMC production environment configuration. Review the actual production
  Terraform workspace, image tag, scaling, networking, secrets, and slot
  settings before release; do not promote the non-production defaults
  unchanged.
- [ ] **Point readiness probes at the intended health endpoint.** The health
  API at `/ftr-forms/api/health` connects to MongoDB and returns `503` if the
  database is unavailable. Terraform's `health_check` default is
  `/ftr-forms`, not that API route. Verify the production platform probe path
  and whether it should test application liveness or database readiness.
- [ ] **Add platform-level rate limiting.** The proxy's IP counter is in-memory
  per process and uses the forwarded IP header. It is not a shared limit
  across scaled instances. Configure edge/API-gateway controls and ensure the
  client IP is derived only from trusted proxies.
- [ ] **Verify monitoring and alert coverage for this app.** Application
  Insights and New Relic initialize only when configured. Confirm production
  connection settings, alert ownership, response procedures, and that the
  alerts in Terraform target this SFMC service rather than another app.
- [ ] **Verify database operational controls.** Confirm production MongoDB
  network restrictions, least-privilege credentials, backups, restore tests,
  retention, capacity, and alerting. The app uses a 10-second MongoDB server
  selection timeout; exercise degraded-database behavior in staging.
- [ ] **Review log retention and volume.** API exchange logging persists every
  request/response to MongoDB and optionally sends it to telemetry providers.
  In addition to PII redaction above, set retention limits and monitor storage
  and ingestion costs.
- [ ] **Verify production CSP and ingress headers.** The app generates a
  per-request nonce-based CSP and configures security headers in
  `next.config.ts`. Test the deployed response through the real proxy/CDN,
  including form submissions, image/font loading, and all required external
  integrations.
- [ ] **Establish performance budgets.** The root layout uses per-request
  `connection()` for nonce-based CSP, so routes render dynamically. Measure
  real-user latency, cold starts, client JavaScript, and key campaign-page
  performance against agreed budgets; confirm caching behavior at the edge.
- [ ] **Verify rollout and recovery.** Document staged deployment, smoke tests,
  rollback criteria, and rollback procedure for the deployed image and
  infrastructure. Confirm the procedure in a non-production environment.

## Evidence reviewed

- Application configuration: `next.config.ts`, `src/proxy.ts`,
  `src/utils/contentSecurityPolicy.ts`
- API handling and health: `src/utils/withErrorHandler.ts`,
  `src/utils/apiLog.ts`, `src/app/api/health/route.ts`
- Database and telemetry: `src/libs/mongoose.ts`, `src/instrumentation.ts`,
  `src/libs/azureInsights.ts`, `src/libs/newRelic.ts`
- Build and deployment: `package.json`, `Dockerfile`, `.gitignore`,
  `terraform/`
- Shared UI and bundle work: `src/components/SiteFooter/`,
  `next.config.ts`
- Developer guidance: `README.md`, `.husky/`
