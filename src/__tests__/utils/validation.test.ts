/**
 * @file __tests__/utils/validation.test.ts
 * @description Unit tests for validation utilities.
 */

import {
  getMissingFields,
  isNonEmptyString,
  sanitiseString,
} from "@/utils/validation";

describe("getMissingFields", () => {
  it("returns missing required fields", () => {
    const body = { name: "Alice" };
    expect(getMissingFields(body, ["name", "email"])).toEqual(["email"]);
  });

  it("returns empty array when all fields are present", () => {
    const body = { name: "Alice", email: "alice@example.com" };
    expect(getMissingFields(body, ["name", "email"])).toEqual([]);
  });

  it("treats empty string as missing", () => {
    const body = { name: "" };
    expect(getMissingFields(body, ["name"])).toEqual(["name"]);
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty string", () => {
    expect(isNonEmptyString("hello")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("returns false for non-string", () => {
    expect(isNonEmptyString(42)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe("sanitiseString", () => {
  it("trims whitespace", () => {
    expect(sanitiseString("  hello  ")).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(sanitiseString(42)).toBe("");
  });
});
