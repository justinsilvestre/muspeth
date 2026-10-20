import { describe, expect, it } from "vitest";
import {
  containsSequence,
  findWordInName,
  tokenize,
  toNameElement,
  toWordId,
} from "./wordForms.ts";

describe("toWordId", () => {
  it("joins the language and the lowercase form", () => {
    expect(toWordId({ language: "en", form: "Pine" })).toBe("word:en:pine");
  });
});

describe("toNameElement", () => {
  it("drops the rank suffix from a Japanese genus name", () => {
    expect(toNameElement("マツ属", "genus")).toBe("マツ");
  });

  it("drops the rank suffix from a Korean genus name", () => {
    expect(toNameElement("소나무속", "genus")).toBe("소나무");
  });

  it("keeps the suffix of a family name, which is named after a genus", () => {
    expect(toNameElement("マツ科", "family")).toBe("マツ科");
  });

  it("keeps a species name whole", () => {
    expect(toNameElement("ヒメ属", "species")).toBe("ヒメ属");
  });

  it("keeps a name without a rank suffix", () => {
    expect(toNameElement("pine", "genus")).toBe("pine");
  });
});

describe("findWordInName", () => {
  it("finds a word that is the whole name, ignoring case", () => {
    expect(findWordInName("pine", "Pine")).toBe("exact");
  });

  it("finds a word among the words of a name", () => {
    expect(findWordInName("pine", "Japanese red pine")).toBe("contained");
  });

  it("finds a word between hyphens", () => {
    expect(findWordInName("willow", "rosebay willow-herb")).toBe("contained");
  });

  it("finds a phrase of several words", () => {
    expect(findWordInName("honey bee", "western honey bee")).toBe("contained");
  });

  it("does not find a word inside a longer word", () => {
    expect(findWordInName("pine", "pineapple")).toBeNull();
  });

  it("finds a Chinese character inside a name", () => {
    expect(findWordInName("松", "松茸")).toBe("contained");
  });

  it("finds two katakana inside a name", () => {
    expect(findWordInName("マツ", "マツノザイセンチュウ")).toBe("contained");
  });

  it("does not look for a single kana inside a name", () => {
    expect(findWordInName("カ", "アカマツ")).toBeNull();
  });

  it("does not look for a two-letter word inside a name", () => {
    expect(findWordInName("ox", "musk ox")).toBeNull();
  });
});

describe("tokenize", () => {
  it("splits on spaces, hyphens and punctuation", () => {
    expect(tokenize("Pine-tree, (red)")).toEqual(["pine", "tree", "red"]);
  });
});

describe("containsSequence", () => {
  it("finds consecutive items", () => {
    expect(containsSequence(["a", "b", "c"], ["b", "c"])).toBe(true);
  });

  it("does not find items that are apart", () => {
    expect(containsSequence(["a", "b", "c"], ["a", "c"])).toBe(false);
  });
});
