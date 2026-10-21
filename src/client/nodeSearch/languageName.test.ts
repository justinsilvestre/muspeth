import { describe, expect, it } from "vitest";
import { languageName } from "./languageName";

describe("languageName", () => {
  it("names a language in English", () => {
    expect(languageName("ja")).toBe("Japanese");
  });

  it("returns nothing for a language without an English name", () => {
    expect(languageName("ote")).toBeUndefined();
  });

  it("returns nothing for a private-use tag", () => {
    expect(languageName("und-x-oldh1241")).toBeUndefined();
  });
});
