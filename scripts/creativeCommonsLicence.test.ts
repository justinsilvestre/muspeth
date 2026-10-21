import { describe, expect, it } from "vitest";
import { toCreativeCommonsLicence } from "./creativeCommonsLicence.ts";

describe("toCreativeCommonsLicence", () => {
  it("reads a licence deed's address", () => {
    expect(toCreativeCommonsLicence("http://creativecommons.org/licenses/by-nc/4.0/")).toBe(
      "CC-BY-NC-4.0",
    );
  });

  it("reads the address of a licence's legal code", () => {
    expect(
      toCreativeCommonsLicence("https://creativecommons.org/licenses/by-nc-nd/3.0/legalcode"),
    ).toBe("CC-BY-NC-ND-3.0");
  });

  it("reads CC0's address", () => {
    expect(toCreativeCommonsLicence("http://creativecommons.org/publicdomain/zero/1.0/")).toBe(
      "CC0-1.0",
    );
  });

  it("reads GBIF's licence codes", () => {
    expect(toCreativeCommonsLicence("CC_BY_SA_4_0")).toBe("CC-BY-SA-4.0");
  });

  it("reads GBIF's code for CC0", () => {
    expect(toCreativeCommonsLicence("CC0_1_0")).toBe("CC0-1.0");
  });

  it("gives nothing for another licence", () => {
    expect(toCreativeCommonsLicence("All rights reserved")).toBeNull();
  });

  it("gives nothing for a missing licence", () => {
    expect(toCreativeCommonsLicence(undefined)).toBeNull();
  });
});
