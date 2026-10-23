/**
 * @file __tests__/models/UBBWifi.test.ts
 * @description Unit tests for the UBBWifi Mongoose model schema and defaults.
 * @jest-environment node
 */

import { UBBWifiModel } from "@/models/UBBWifi";

describe("UBBWifiModel", () => {
  describe("collection and model registration", () => {
    it("registers as UBBWifi against the ubbwifi collection", () => {
      expect(UBBWifiModel.modelName).toBe("UBBWifi");
      expect(UBBWifiModel.collection.name).toBe("ubbwifi");
    });
  });

  describe("schema defaults", () => {
    it("applies UBB campaign defaults for empty documents", () => {
      const doc = new UBBWifiModel({});

      expect(doc.PageName).toBe("UBB-Connected Living");
      expect(doc.Offer).toBe("Unbreakable $25/mo");
      expect(doc.ConfirmationCheckBox).toBe(false);
      expect(doc.FirstName).toBe("");
      expect(doc.EmailAddress).toBe("");
    });
  });

  describe("field normalisation and validation", () => {
    it("lowercases EmailAddress", () => {
      const doc = new UBBWifiModel({ EmailAddress: "Jane.Doe@Example.COM" });

      expect(doc.EmailAddress).toBe("jane.doe@example.com");
    });

    it("trims string fields", () => {
      const doc = new UBBWifiModel({
        FirstName: "  Jane  ",
        City: "  Dallas  ",
      });

      expect(doc.FirstName).toBe("Jane");
      expect(doc.City).toBe("Dallas");
    });

    it("rejects State values longer than two characters", async () => {
      const doc = new UBBWifiModel({ State: "Texas" });

      await expect(doc.validate()).rejects.toMatchObject({
        errors: expect.objectContaining({
          State: expect.anything(),
        }),
      });
    });

    it("accepts a valid two-character State abbreviation", async () => {
      const doc = new UBBWifiModel({ State: "TX" });

      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });

  describe("Adobe Campaign tracking fields", () => {
    it("stores optional campaign parameters when provided", () => {
      const doc = new UBBWifiModel({
        EMEID: "abc123",
        CUHID: "hash-id",
        CMP: "CRM_TEST",
        BID: "628055001",
      });

      expect(doc.EMEID).toBe("abc123");
      expect(doc.CUHID).toBe("hash-id");
      expect(doc.CMP).toBe("CRM_TEST");
      expect(doc.BID).toBe("628055001");
    });
  });

  describe("indexes", () => {
    it("defines indexes for common UBB query patterns", () => {
      const indexNames = UBBWifiModel.schema
        .indexes()
        .map((entry) => entry[1]?.name)
        .filter(Boolean);

      expect(indexNames).toEqual(
        expect.arrayContaining([
          "email_1",
          "gbluid_1",
          "createdAt_-1",
          "postalCode_1",
          "email_createdAt",
        ]),
      );
    });
  });
});
