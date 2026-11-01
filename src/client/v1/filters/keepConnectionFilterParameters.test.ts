import { describe, expect, it } from "vitest";
import { keepConnectionFilterParameters } from "./keepConnectionFilterParameters";

describe("keepConnectionFilterParameters", () => {
  it("keeps every parameter of the filter", () => {
    const params = new URLSearchParams(
      "kind=interaction&kind=likeness&basis=observed&source=mangal&flaggedWith=text_match&notFlaggedWith=suspected_error",
    );
    expect(keepConnectionFilterParameters(params).toString()).toBe(params.toString());
  });

  it("drops the parameters that are not part of the filter", () => {
    const params = new URLSearchParams("from=a&kind=interaction&to=b&near=35.5%2C138.3");
    expect(keepConnectionFilterParameters(params).toString()).toBe("kind=interaction");
  });
});
