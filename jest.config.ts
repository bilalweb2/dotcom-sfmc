import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  /** Provide the path to your Next.js app to load next.config.ts and .env files */
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  /** Run global setup (jest-dom matchers) after the test environment is installed */
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    /** Handle module aliases (must match tsconfig paths) */
    "^@/(.*)$": "<rootDir>/src/$1",
    /** Handle static asset imports */
    "^.+\\.module\\.(css|sass|scss)$": "<rootDir>/src/__mocks__/styleMock.ts",
    "^.+\\.(css|sass|scss)$": "<rootDir>/src/__mocks__/styleMock.ts",
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$":
      "<rootDir>/src/__mocks__/fileMock.ts",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/index.ts",
    "!src/app/layout.tsx",
  ],
};

export default createJestConfig(config);
