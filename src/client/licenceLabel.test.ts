import { describe, expect, it } from "vitest";
import { licenceLabel, licenceLink } from "./licenceLabel";

describe("licenceLabel", () => {
  it.each([
    ["CC0-1.0", "CC0 1.0"],
    ["CC-BY-4.0", "CC BY 4.0"],
    ["LicenseRef-web-of-life-attribution", "Web of Life attribution"],
    ["MIT", "MIT"],
  ])("names %s as %s", (licence, label) => {
    expect(licenceLabel(licence)).toBe(label);
  });
});

describe("licenceLink", () => {
  it("links CC0 to its deed", () => {
    expect(licenceLink("CC0-1.0")).toBe("https://creativecommons.org/publicdomain/zero/1.0/");
  });

  it("links CC BY to its deed", () => {
    expect(licenceLink("CC-BY-4.0")).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("has no link for a licence without a known deed", () => {
    expect(licenceLink("LicenseRef-web-of-life-attribution")).toBeUndefined();
  });
});
