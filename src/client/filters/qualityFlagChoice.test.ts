import { describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../../shared/connectionFilter";
import { chooseQualityFlag, qualityFlagChoiceOf } from "./qualityFlagChoice";

describe("qualityFlagChoiceOf", () => {
  it("shows a flag that the filter does not mention", () => {
    expect(qualityFlagChoiceOf(emptyConnectionFilter, "suspected_error")).toBe("show");
  });

  it("shows only connections with a flag the filter requires", () => {
    const filter = { ...emptyConnectionFilter, flaggedWith: ["suspected_error" as const] };
    expect(qualityFlagChoiceOf(filter, "suspected_error")).toBe("only");
  });

  it("hides connections with a flag the filter excludes", () => {
    const filter = { ...emptyConnectionFilter, notFlaggedWith: ["suspected_error" as const] };
    expect(qualityFlagChoiceOf(filter, "suspected_error")).toBe("hide");
  });
});

describe("chooseQualityFlag", () => {
  it("moves a flag from required to excluded", () => {
    const filter = { ...emptyConnectionFilter, flaggedWith: ["suspected_error" as const] };
    const next = chooseQualityFlag(filter, "suspected_error", "hide");
    expect([next.flaggedWith, next.notFlaggedWith]).toEqual([[], ["suspected_error"]]);
  });

  it("forgets a flag that is shown", () => {
    const filter = { ...emptyConnectionFilter, notFlaggedWith: ["suspected_error" as const] };
    expect(chooseQualityFlag(filter, "suspected_error", "show")).toEqual(emptyConnectionFilter);
  });

  it("keeps the choices made for other flags", () => {
    const filter = { ...emptyConnectionFilter, notFlaggedWith: ["sampling_bias" as const] };
    const next = chooseQualityFlag(filter, "suspected_error", "hide");
    expect(next.notFlaggedWith).toEqual(["sampling_bias", "suspected_error"]);
  });
});
