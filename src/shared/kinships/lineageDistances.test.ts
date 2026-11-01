import { describe, expect, it } from "vitest";
import { lineageDistances } from "./lineageDistances";

const lineages = new Map([
  [
    "red pine",
    ["Plantae", "Tracheophyta", "Pinopsida", "Pinales", "Pinaceae", "Pinus", "P. densiflora"],
  ],
  [
    "black pine",
    ["Plantae", "Tracheophyta", "Pinopsida", "Pinales", "Pinaceae", "Pinus", "P. thunbergii"],
  ],
  [
    "matsutake",
    [
      "Fungi",
      "Basidiomycota",
      "Agaricomycetes",
      "Agaricales",
      "Tricholomataceae",
      "Tricholoma",
      "T. matsutake",
    ],
  ],
]);

describe("lineageDistances", () => {
  it("brings together organisms that share most of their lineage", () => {
    const [redPine] = lineageDistances(["red pine", "black pine"], lineages);
    expect(redPine?.[1]).toBeCloseTo(1 / 7);
  });

  it("puts organisms of different kingdoms as far apart as possible", () => {
    const [redPine] = lineageDistances(["red pine", "matsutake"], lineages);
    expect(redPine?.[1]).toBe(1);
  });

  it("puts an organism without a lineage as far as possible from the others", () => {
    const [redPine] = lineageDistances(["red pine", "unplaced"], lineages);
    expect(redPine?.[1]).toBe(1);
  });
});
