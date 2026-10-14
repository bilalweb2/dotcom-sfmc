/**
 * @file types/env.d.ts
 * @description TypeScript declarations for process.env variables.
 * Keeps environment variable usage type-safe across the project.
 */

declare module "newrelic" {
  const agent: {
    recordLogEvent: (event: Record<string, string | number>) => void;
  };
  export default agent;
}

declare namespace NodeJS {
  interface ProcessEnv {
    /** MongoDB connection string */
    MONGODB_URI: string;
    /** Application environment */
    NODE_ENV: "development" | "production" | "test";
    /** Base URL for the app (used in server-side absolute URL construction) */
    NEXT_PUBLIC_APP_URL: string;
    /** API secret for server-to-server requests */
    API_SECRET?: string;
    /**
     * Azure Application Insights connection string.
     * When set, every API request and response is sent to Azure Monitor.
     */
    APPLICATIONINSIGHTS_CONNECTION_STRING?: string;
    /** New Relic app name shown in the UI. Defaults to dotcom-sfmc. */
    NEW_RELIC_APP_NAME?: string;
    /**
     * New Relic license key.
     * When set, every API request and response is sent to New Relic Logs.
     */
    NEW_RELIC_LICENSE_KEY?: string;
  }
}
