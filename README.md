# Dotcom SFMC — Salesforce Marketing Cloud

Customer-facing landing pages and form-processing APIs for Frontier/Verizon marketing campaigns, built with **Next.js 16 App Router**, **React 19**, **TypeScript**, and **MongoDB (Mongoose)**.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Git hooks](#git-hooks)
- [Testing](#testing)

---

## Getting Started

```bash
# Install dependencies
npm install

# Create local env file
cp .env.example .env.local  # then fill in MONGODB_URI

# Start development server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
sfmc/
├── public/                       # Static assets (images, SVGs)
│   └── images/
│       ├── svg/                  # Logo SVGs (desktop + mobile)
│       └── checkmark.png
└── src/
    ├── app/                      # Next.js App Router pages & API routes
    │   ├── layout.tsx            # Root HTML shell (Geist fonts, RootLayout)
    │   ├── page.tsx              # Home page (/)
    │   ├── globals.css           # Global styles
    │   ├── favicon.ico
    │   ├── Unsubscribe-form/     # /Unsubscribe-form
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── Unsubscribe-Confirmation/ # /Unsubscribe-Confirmation
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── UnsubscribePreferences/   # /UnsubscribePreferences
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── WHWF012025/           # /WHWF012025
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── WHWF-Confirmation/    # /WHWF-Confirmation
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   └── api/
    │       ├── health/           # GET  /api/health
    │       ├── UnsubFormProcessing/           # POST /api/UnsubFormProcessing
    │       ├── Unsubscribe-Form-Processing/   # POST /api/Unsubscribe-Form-Processing
    │       └── WHWF_Processing/               # POST /api/WHWF_Processing
    ├── components/               # Page UI and shared UI
    │   ├── Button/
    │   ├── ErrorBoundary/
    │   ├── SiteHeader/           # Frontier/Verizon responsive header
    │   ├── SiteFooter/           # Site footer
    │   ├── HomePage/
    │   ├── UnsubscribePage/
    │   ├── UnsubscribeConfirmationPage/
    │   ├── UnsubscribePreferencesPage/
    │   ├── WHWFPage/
    │   └── WHWFConfirmationPage/
    ├── constants/                # App-wide constants (APP_NAME, HTTP_STATUS, API_ROUTES)
    ├── layouts/
    │   ├── RootLayout/           # ErrorBoundary shell
    │   └── PageLayout/           # SiteHeader + main + SiteFooter shell
    ├── libs/
    │   ├── mongoose.ts           # Mongoose connection singleton
    │   ├── azureInsights.ts      # Application Insights client
    │   └── newRelic.ts           # New Relic agent
    ├── instrumentation.ts        # Starts Azure Application Insights and New Relic
    ├── logger.ts                 # Structured logger (console, Azure, and New Relic)
    ├── models/
    │   ├── Unsubscribe.ts        # Mongoose model → `unsubscribe` collection
    │   └── WholeHomeWifi.ts      # Mongoose model → `wholehomewifi` collection
    ├── proxy.ts                  # Next.js 16 request hook (request ID, auth, rate limit)
    ├── types/
    │   ├── api.ts                # Shared API response / pagination types
    │   └── env.d.ts              # process.env type declarations
    └── utils/
        ├── response.ts           # successResponse / errorResponse helpers
        ├── validation.ts         # getMissingFields, sanitiseString, isNonEmptyString
        ├── unsubscribeValidation.ts
        ├── unsubscribePreferencesValidation.ts
        ├── whwfValidation.ts
        ├── withErrorHandler.ts   # Route Handler error wrapper + API logging
        └── apiLog.ts             # Request/response log sent to Azure and New Relic
```

---

## Pages & Routes

| URL                         | Page Component                | Description                           |
| --------------------------- | ----------------------------- | ------------------------------------- |
| `/`                         | `HomePage`                    | Home landing page                     |
| `/Unsubscribe-form`         | `UnsubscribePage`             | Email-only unsubscribe form           |
| `/Unsubscribe-Confirmation` | `UnsubscribeConfirmationPage` | Confirmation after unsubscribe        |
| `/UnsubscribePreferences`   | `UnsubscribePreferencesPage`  | Per-category unsubscribe preferences  |
| `/WHWF012025`               | `WHWFPage`                    | Whole-Home Wi-Fi upgrade landing page |
| `/WHWF-Confirmation`        | `WHWFConfirmationPage`        | WHWF order confirmation               |

All page routes use the `PageLayout` shell (Frontier header + optional footer).

---

## API Endpoints

### `GET /api/health`

Health check. Returns app status, version, uptime, and environment.

**Response `200`**

```json
{
  "status": "ok",
  "app": "SFMC",
  "version": "0.1.0",
  "uptime": 123.45,
  "timestamp": "2026-09-28T00:00:00.000Z",
  "environment": "production"
}
```

---

### `POST /api/UnsubFormProcessing`

Accepts an email unsubscribe request (with or without per-category preferences). Saves to the `unsubscribe` MongoDB collection.

**Content-Type:** `application/x-www-form-urlencoded` or `application/json`

**Required fields:** `EmailAddress`

**Optional fields:**

| Field                            | Type    | Default |
| -------------------------------- | ------- | ------- |
| `submissionType`                 | string  | `""`    |
| `GBLUID`                         | string  | `""`    |
| `SubscriberId`                   | integer | `0`     |
| `JobId`                          | integer | `0`     |
| `ListId`                         | integer | `0`     |
| `BatchId`                        | integer | `0`     |
| `unsubscribedtoAddedProtection`  | 0 \| 1  | `0`     |
| `unsubscribedtoHelpfulTips`      | 0 \| 1  | `0`     |
| `unsubscribedtoInternetUpgrades` | 0 \| 1  | `0`     |
| `unsubscribedtoNewProducts`      | 0 \| 1  | `0`     |
| `subscribedtoNewsletters`        | 0 \| 1  | `0`     |
| `unsubscribedtoReferaFriend`     | 0 \| 1  | `0`     |
| `unsubscribedtoRewards`          | 0 \| 1  | `0`     |
| `unsubscribedtoSpecialOffers`    | 0 \| 1  | `0`     |
| `unsubscribedtoWiFiEnhancements` | 0 \| 1  | `0`     |
| `unsubscribedtoYouTubeTV`        | 0 \| 1  | `0`     |
| `Unsubscribed`                   | 0 \| 1  | `0`     |

**Response `200`**

```json
{ "status": "OK", "result": "1" }
```

**Response `400`** — `EmailAddress` missing  
**Response `500`** — Internal server error

---

### `POST /api/Unsubscribe-Form-Processing`

Accepts the full preferences-based unsubscribe payload. Same field contract as above, but all preference fields default to `1` (fully unsubscribed) when submitted from the preferences page.

**Content-Type:** `application/x-www-form-urlencoded`

**Required fields:** `EmailAddress`

**Response `200`**

```json
{ "status": "OK", "result": "1" }
```

**Response `400`** — `EmailAddress` missing  
**Response `500`** — Internal server error

---

### `POST /api/WHWF_Processing`

Accepts the Whole-Home Wi-Fi upgrade form payload. Saves to the `wholehomewifi` MongoDB collection.

**Content-Type:** `application/json`

**Body:**

| Field                  | Type           | Required | Default                             |
| ---------------------- | -------------- | -------- | ----------------------------------- |
| `FirstName`            | string         | —        | `""`                                |
| `LastName`             | string         | —        | `""`                                |
| `EmailAddress`         | string (email) | —        | `""`                                |
| `Address`              | string         | —        | `""`                                |
| `City`                 | string         | —        | `""`                                |
| `State`                | string         | —        | `""`                                |
| `PostalCode`           | string         | —        | `""`                                |
| `GBLUID`               | string         | —        | `""`                                |
| `BTN`                  | string         | —        | `""`                                |
| `submissionType`       | string         | —        | `""`                                |
| `PageName`             | string         | —        | `"BAU WHWF - v1"`                   |
| `Offer`                | string         | —        | `"$0 for 1 month and then $10/mo."` |
| `ConfirmationCheckBox` | 0 \| 1         | —        | `1`                                 |

**Response `200`**

```json
{ "status": "OK", "result": "1" }
```

**Response `400`** — Validation error  
**Response `500`** — Internal server error

---

## Data Models

### `Unsubscribe` → collection: `unsubscribe`

| Field            | Type              | Description                                           |
| ---------------- | ----------------- | ----------------------------------------------------- |
| `submissionType` | String            | Form submission identifier                            |
| `GBLUID`         | String            | Global user ID                                        |
| `SubscriberId`   | Number            | SFMC subscriber ID                                    |
| `JobId`          | Number            | SFMC job ID                                           |
| `ListId`         | Number            | SFMC list ID                                          |
| `BatchId`        | Number            | SFMC batch ID                                         |
| `EmailAddress`   | String (required) | Subscriber email, lowercased                          |
| `Preferences`    | Object            | Per-category unsubscribe flags (see API fields above) |
| `createdAt`      | Date              | Auto-generated timestamp                              |

### `WholeHomeWifi` → collection: `wholehomewifi`

| Field                  | Type          | Description                |
| ---------------------- | ------------- | -------------------------- |
| `submissionType`       | String        | Form submission identifier |
| `FirstName`            | String        | Customer first name        |
| `LastName`             | String        | Customer last name         |
| `EmailAddress`         | String        | Customer email, lowercased |
| `Address`              | String        | Service address            |
| `City`                 | String        | Service city               |
| `State`                | String        | Service state (2-letter)   |
| `PostalCode`           | String        | Service ZIP code           |
| `GBLUID`               | String        | Global user ID             |
| `BTN`                  | String        | Billing telephone number   |
| `PageName`             | String        | Campaign page identifier   |
| `Offer`                | String        | Offer description          |
| `ConfirmationCheckBox` | Number (0\|1) | Terms acceptance flag      |
| `createdAt`            | Date          | Auto-generated timestamp   |

---

## Architecture

### Data Flow

```
Browser
  └─ Server Component (app/<route>/page.tsx)
       └─ Renders page component (components/<PageName>/<PageName>.tsx)
            └─ Client Component dispatches fetch() → /api/<route>
                 └─ Route Handler (app/api/<route>/route.ts)
                      ├─ withErrorHandler HOF (error handling)
                      ├─ connectMongoose()  (DB connection)
                      └─ Mongoose Model.create() / .find()
```

### Key Patterns

| Pattern            | Location                    | Purpose                                                                |
| ------------------ | --------------------------- | ---------------------------------------------------------------------- |
| `withErrorHandler` | `utils/withErrorHandler.ts` | Wraps every Route Handler; catches unhandled errors → `500`            |
| `proxy.ts`         | `src/proxy.ts`              | Next.js 16 request hook — `X-Request-Id`, rate limit, private API auth |
| `ErrorBoundary`    | `components/ErrorBoundary/` | Catches render errors; shown via `RootLayout`                          |
| `PageLayout`       | `layouts/PageLayout/`       | Shared `SiteHeader` + `main` + `SiteFooter` wrapper                    |
| `logger`           | `logger.ts`                 | Structured logger. API calls also go to Azure and New Relic            |

### Route Protection

Routes **not** requiring auth (public):

- `/`
- `/api/health`
- `/api/WHWF_Processing`
- `/api/UnsubFormProcessing`
- `/api/Unsubscribe-Form-Processing`

All other `/api/*` routes require a `Bearer <token>` header. That check lives in `src/proxy.ts`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB connection string (required)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ftr-forms

# Public base URL (used for absolute URL construction)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API secret for server-to-server requests (optional)
API_SECRET=your-secret-here

# Azure Application Insights (optional). Every API request and response is logged when this is set.
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=<key>;IngestionEndpoint=https://<region>.in.applicationinsights.azure.com/

# New Relic (optional). Every API request and response is logged when the license key is set.
NEW_RELIC_APP_NAME=dotcom-sfmc
NEW_RELIC_LICENSE_KEY=your-license-key
```

---

## Scripts

| Command                  | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `npm run dev`            | Start dev server with Turbopack                                |
| `npm run build`          | Production build                                               |
| `npm run start`          | Start production server                                        |
| `npm run lint`           | ESLint check                                                   |
| `npm run lint:fix`       | ESLint auto-fix                                                |
| `npm run format`         | Prettier format all files                                      |
| `npm run format:check`   | Prettier format check                                          |
| `npm run type-check`     | TypeScript type check (no emit)                                |
| `npm test`               | Run all Jest tests                                             |
| `npm run test:watch`     | Jest in watch mode                                             |
| `npm run test:coverage`  | Jest with coverage report                                      |
| `npm run quality`        | Lint, format check, type check, and tests (runs on `git push`) |
| `npm run prebuild:check` | Lint, type check, and tests with coverage (pre-build gate)     |
| `npm run prepare`        | Install Husky git hooks (runs automatically on `npm install`)  |
| `npm run audit`          | Dependency audit at moderate severity or higher                |
| `npm run audit:fix`      | Apply npm's automatic audit fixes                              |
| `npm run audit:ci`       | High-severity audit, JSON output                               |

---

## Git hooks

[Husky](https://typicode.github.io/husky/) installs a **pre-push** hook from `.husky/pre-push`. `npm install` runs `prepare`, which registers that hook locally.

Before a push to the remote, the hook runs `npm run quality`:

1. `npm run lint` — ESLint
2. `npm run format:check` — Prettier
3. `npm run type-check` — TypeScript (`tsc --noEmit`)
4. `npm test` — Jest

If any step fails, the push is aborted. Run `npm run quality` locally to see the same checks without pushing.

---

## Testing

Tests live in `src/__tests__/` and mirror the `src/` directory structure.

```
src/__tests__/
├── api/
│   └── health.test.ts          # Integration test: GET /api/health
├── components/
│   └── Button.test.tsx         # Unit tests: Button component
└── utils/
    └── validation.test.ts      # Unit tests: validation helpers
```

Mock files:

- `src/__mocks__/fileMock.ts` — static file mock (images, fonts)
- `src/__mocks__/styleMock.ts` — CSS module mock

Run tests:

```bash
npm test                    # all tests
npm run test:coverage       # with coverage
```
