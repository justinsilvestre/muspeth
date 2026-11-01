import { describe, expect, it } from "vitest";
import type { BodySet, Sharing } from "./BodySet";
import { countMembranes, toSharingTable, weightSteps } from "./toSharingTable";

const visitors = {
  relation: "visitors",
  licences: ["CC0-1.0"],
  links: [
    { body: "Daucus carota", partner: "Apis mellifera", weight: 10, flags: [] },
    { body: "Lotus corniculatus", partner: "Apis mellifera", weight: 2, flags: [] },
    { body: "Daucus carota", partner: "Musca domestica", weight: 5, flags: [] },
  ],
} satisfies Sharing;

const set = {
  id: "test",
  name: "Test",
  group: "Tests",
  description: "",
  bodyNoun: { one: "plant", many: "plants" },
  labelStyle: "species",
  bodies: [
    { id: "carrot", name: "Daucus carota" },
    { id: "clover", name: "Lotus corniculatus" },
    { id: "thistle", name: "Cirsium vulgare" },
  ],
  sharings: [visitors],
} satisfies BodySet;

describe("toSharingTable", () => {
  it("lists every body as a unit, linked or not", () => {
    expect(toSharingTable(set, visitors).languages).toEqual([
      "Daucus carota",
      "Lotus corniculatus",
      "Cirsium vulgare",
    ]);
  });

  it("marks the bodies each partner is linked to", () => {
    expect(toSharingTable(set, visitors).innovations).toEqual([
      { label: "Apis mellifera", members: new Set(["Daucus carota", "Lotus corniculatus"]) },
      { label: "Musca domestica", members: new Set(["Daucus carota"]) },
    ]);
  });

  it("leaves out links weighted below the minimum", () => {
    expect(toSharingTable(set, visitors, 5).innovations).toEqual([
      { label: "Apis mellifera", members: new Set(["Daucus carota"]) },
      { label: "Musca domestica", members: new Set(["Daucus carota"]) },
    ]);
  });
});

describe("countMembranes", () => {
  it("counts the distinct sets of several bodies short of the whole set", () => {
    expect(countMembranes(set, visitors)).toBe(1);
  });
});

describe("weightSteps", () => {
  it("lists each distinct weight once, in rising order", () => {
    expect(weightSteps(visitors)).toEqual([2, 5, 10]);
  });

  it("is empty for an unweighted sharing", () => {
    expect(weightSteps({ relation: "descent", licences: [], links: [] })).toEqual([]);
  });
});
