import {
  readCampaignParams,
  sanitiseCampaignParams,
} from "@/utils/campaignParams";

describe("campaignParams", () => {
  it("reads all known parameters and omits absent ones", () => {
    const params = new URLSearchParams(
      "EMHID=emhid-value&EMEID=emeid-value&CUHID=cuhid-value&CMP=cmp-value&BID=bid-value&other=ignored",
    );

    expect(readCampaignParams(params)).toEqual({
      EMHID: "emhid-value",
      EMEID: "emeid-value",
      CUHID: "cuhid-value",
      CMP: "cmp-value",
      BID: "bid-value",
    });
    expect(readCampaignParams(new URLSearchParams())).toEqual({});
  });

  it("sanitises provided values and omits empty or invalid values", () => {
    expect(
      sanitiseCampaignParams({
        EMHID: " <b>emhid</b> ",
        EMEID: 123,
        CUHID: "cuhid",
        CMP: "",
        BID: "bid",
        ignored: "value",
      }),
    ).toEqual({
      EMHID: "emhid",
      CUHID: "cuhid",
      BID: "bid",
    });
  });

  it("truncates values to their configured maximum lengths", () => {
    const params = sanitiseCampaignParams({
      CMP: "c".repeat(250),
      BID: "b".repeat(120),
    });

    expect(params.CMP).toHaveLength(200);
    expect(params.BID).toHaveLength(100);
  });
});
