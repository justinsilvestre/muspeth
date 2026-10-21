import { describe, expect, it } from "vitest";
import { listSearchNames, mentionsName, pluralize } from "./museumNames.ts";

describe("listSearchNames", () => {
  const organism = {
    id: "x",
    label: "Pinus densiflora",
    englishNames: ["Japanese red pine", "pine"],
    ancestors: [],
  };

  it("lists the scientific name first", () => {
    expect(listSearchNames(organism)[0]).toEqual({ name: "Pinus densiflora", kind: "scientific" });
  });

  it("marks the other names as common", () => {
    expect(listSearchNames(organism)[1]?.kind).toBe("common");
  });

  it("leaves out names that are too short", () => {
    expect(listSearchNames({ ...organism, englishNames: ["ant"] })).toHaveLength(1);
  });

  it("lists a name once even when its case differs", () => {
    expect(listSearchNames({ ...organism, englishNames: ["pinus densiflora"] })).toHaveLength(1);
  });
});

describe("pluralize", () => {
  it.each([
    ["bee", "bees"],
    ["horse", "horses"],
    ["fox", "foxes"],
    ["beetle", "beetles"],
    ["lily", "lilies"],
    ["monkey", "monkeys"],
  ])("makes %s into %s", (name, plural) => {
    expect(pluralize(name)).toBe(plural);
  });
});

describe("mentionsName", () => {
  it("finds a name as whole words", () => {
    expect(mentionsName("Old Pine Tree", "pine")).toBe(true);
  });

  it("finds a name with a plural ending", () => {
    expect(mentionsName("Flowering Branch with Bees", "bee")).toBe(true);
  });

  it("does not find a name inside a longer word", () => {
    expect(mentionsName("Pineapple still life", "pine")).toBe(false);
  });

  it("does not find a name that has other letters before it", () => {
    expect(mentionsName("Carpine", "pine")).toBe(false);
  });
});
