import { PendingDiscoModel } from "@/models/PendingDisco";
import { WholeHomeWifiModel } from "@/models/WholeHomeWifi";

describe("append-only form submission schemas", () => {
  it("omits GBLUID and unset campaign params from WHWF documents", () => {
    expect(WholeHomeWifiModel.schema.path("GBLUID")).toBeUndefined();
    expect(
      WholeHomeWifiModel.schema
        .indexes()
        .some(([, options]) => options?.name?.includes("gbluid")),
    ).toBe(false);

    const document = new WholeHomeWifiModel({});
    expect(document.get("FirstName")).toBeUndefined();
    expect(document.get("LastName")).toBeUndefined();
    expect(document.get("EmailAddress")).toBeUndefined();
    expect(document.get("Address")).toBeUndefined();
    expect(document.get("City")).toBeUndefined();
    expect(document.get("State")).toBeUndefined();
    expect(document.get("PostalCode")).toBeUndefined();
    expect(document.get("BTN")).toBeUndefined();
    expect(document.get("EMHID")).toBeUndefined();
    expect(document.get("EMEID")).toBeUndefined();
    expect(document.get("CUHID")).toBeUndefined();
    expect(document.get("CMP")).toBeUndefined();
    expect(document.get("BID")).toBeUndefined();
  });

  it("omits GBLUID and unset campaign params from Pending Disco documents", () => {
    expect(PendingDiscoModel.schema.path("GBLUID")).toBeUndefined();
    expect(
      PendingDiscoModel.schema
        .indexes()
        .some(([, options]) => options?.name?.includes("gbluid")),
    ).toBe(false);

    const document = new PendingDiscoModel({});
    expect(document.get("submissionType")).toBeUndefined();
    expect(document.get("FirstName")).toBeUndefined();
    expect(document.get("LastName")).toBeUndefined();
    expect(document.get("EmailAddress")).toBeUndefined();
    expect(document.get("Address")).toBeUndefined();
    expect(document.get("City")).toBeUndefined();
    expect(document.get("State")).toBeUndefined();
    expect(document.get("PostalCode")).toBeUndefined();
    expect(document.get("BTN")).toBeUndefined();
    expect(document.get("EMHID")).toBeUndefined();
    expect(document.get("EMEID")).toBeUndefined();
    expect(document.get("CUHID")).toBeUndefined();
    expect(document.get("CMP")).toBeUndefined();
    expect(document.get("BID")).toBeUndefined();
  });
});
