import { describe, expect, it } from "vitest";
import { isWrittenInScriptOf, toGlottologLanguageTag, toLanguageTag } from "./languageTags.ts";

describe("toLanguageTag", () => {
  it("shortens a three-letter code that has a two-letter equivalent", () => {
    expect(toLanguageTag("jpn")).toBe("ja");
  });

  it("keeps a three-letter code that has no two-letter equivalent", () => {
    expect(toLanguageTag("haw")).toBe("haw");
  });

  it("gives null for an empty code", () => {
    expect(toLanguageTag("")).toBeNull();
  });

  it("gives null for a code that is not a language tag", () => {
    expect(toLanguageTag("not a code")).toBeNull();
  });
});

describe("toGlottologLanguageTag", () => {
  it("prefers the ISO code when there is one", () => {
    expect(toGlottologLanguageTag("mand1415", "cmn")).toBe("zh");
  });

  it("tags a common donor language by its glottocode", () => {
    expect(toGlottologLanguageTag("stan1288")).toBe("es");
  });

  it("gives other languoids a private-use tag", () => {
    expect(toGlottologLanguageTag("slav1255")).toBe("und-x-slav1255");
  });

  it("gives null without a glottocode or ISO code", () => {
    expect(toGlottologLanguageTag("")).toBeNull();
  });
});

describe("isWrittenInScriptOf", () => {
  it("accepts a Japanese name in katakana", () => {
    expect(isWrittenInScriptOf("アカマツ", "ja")).toBe(true);
  });

  it("rejects a Japanese name in romanization", () => {
    expect(isWrittenInScriptOf("Aka-matsu", "ja")).toBe(false);
  });

  it("accepts any name in a language written in Latin script", () => {
    expect(isWrittenInScriptOf("goliatmusseron", "sv")).toBe(true);
  });
});
