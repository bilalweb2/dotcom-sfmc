import "@testing-library/jest-dom";

jest.mock("@/models/AuditLog", () => ({
  AuditLogModel: {
    create: jest.fn().mockResolvedValue({ _id: "mock-audit-id" }),
  },
}));
