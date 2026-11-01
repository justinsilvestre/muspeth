import { describe, expect, it } from "vitest";
import { aOrAn, type BodySet, countOf, labelOf, sublabelOf } from "./BodySet";

const set = {
  id: "test",
  name: "Test",
  group: "Tests",
  description: "",
  bodyNoun: { one: "organism", many: "organisms" },
  labelStyle: "species",
  bodies: [
    { id: "bee", name: "Apis mellifera", commonName: "Honey Bee" },
    { id: "gecko", name: "Phelsuma ornata", commonName: "Mauritius ornate day gecko" },
    { id: "fly", name: "Musca domestica" },
    { id: "site", name: "Mt. Yufu, Japan", label: "Yufu" },
  ],
  sharings: [],
} satisfies BodySet;

describe("labelOf", () => {
  it("abbreviates the scientific name", () => {
    expect(labelOf(set, "Apis mellifera")).toBe("A. mellifera");
  });

  it("uses a given label over the name", () => {
    expect(labelOf(set, "Mt. Yufu, Japan")).toBe("Yufu");
  });
});

describe("sublabelOf", () => {
  it("gives a short English name", () => {
    expect(sublabelOf(set, "Apis mellifera")).toBe("Honey Bee");
  });

  it("leaves out a long English name", () => {
    expect(sublabelOf(set, "Phelsuma ornata")).toBeUndefined();
  });

  it("gives nothing when there is no English name", () => {
    expect(sublabelOf(set, "Musca domestica")).toBeUndefined();
  });
});

describe("aOrAn", () => {
  it("takes an before a vowel", () => {
    expect(aOrAn("organism")).toBe("an organism");
  });
});

describe("countOf", () => {
  it("uses the singular for one", () => {
    expect(countOf(1, { one: "plant", many: "plants" })).toBe("1 plant");
  });
});
