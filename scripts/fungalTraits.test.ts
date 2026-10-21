import { describe, expect, it } from "vitest";
import { compareFungalTraits, parseFungalTraits } from "./fungalTraits.ts";

const columns = [
  "Phylum",
  "Class",
  "GENUS",
  "primary_lifestyle",
  "Secondary_lifestyle",
  "Decay_substrate_template",
  "Aquatic_habitat_template",
  "Ectomycorrhiza_exploration_type_template",
  "Fruitbody_type_template",
];

function makeTable(...rows: string[][]) {
  return [columns, ...rows].map((row) => row.join("\t")).join("\n");
}

const tricholoma = [
  "Basidiomycota",
  "Agaricomycetes",
  "Tricholoma",
  "ectomycorrhizal",
  "",
  "",
  "non-aquatic",
  "medium-distance_fringe",
  "agaricoid",
];
const termitomyces = [
  "Basidiomycota",
  "Agaricomycetes",
  "Termitomyces",
  "litter_saprotroph",
  "",
  "leaf/fruit/seed,wood",
  "non-aquatic",
  "unknown",
  "agaricoid",
];

describe("parseFungalTraits", () => {
  it("lists a genus's lifestyle traits as field and value", () => {
    const [record] = parseFungalTraits(makeTable(tricholoma));
    expect(record?.traits).toEqual(
      new Set([
        "lifestyle:ectomycorrhizal",
        "aquatic habitat:non-aquatic",
        "ectomycorrhizal exploration type:medium-distance_fringe",
      ]),
    );
  });

  it("splits lists of decay substrates and leaves out unknown values", () => {
    const [record] = parseFungalTraits(makeTable(termitomyces));
    expect(record?.traits).toEqual(
      new Set([
        "lifestyle:litter_saprotroph",
        "decay substrate:leaf/fruit/seed",
        "decay substrate:wood",
        "aquatic habitat:non-aquatic",
      ]),
    );
  });

  it("groups genera by phylum", () => {
    expect(parseFungalTraits(makeTable(tricholoma))[0]?.group).toBe("Basidiomycota");
  });

  it("hints the phylum and class to GBIF", () => {
    expect(parseFungalTraits(makeTable(tricholoma))[0]?.gbifHints).toEqual({
      phylum: "Basidiomycota",
      class: "Agaricomycetes",
      rank: "GENUS",
    });
  });

  it("leaves out taxa that are placed only as incertae sedis", () => {
    const row = ["Ascomycota", "Ascomycota class incertae sedis", ...tricholoma.slice(2)];
    expect(parseFungalTraits(makeTable(row))[0]?.gbifHints.class).toBeUndefined();
  });

  it("keeps only the first row of a genus listed twice", () => {
    expect(parseFungalTraits(makeTable(tricholoma, tricholoma))).toHaveLength(1);
  });

  it("skips genera without a primary lifestyle", () => {
    const row = [...tricholoma.slice(0, 3), "", ...tricholoma.slice(4)];
    expect(parseFungalTraits(makeTable(row))).toHaveLength(0);
  });
});

describe("compareFungalTraits", () => {
  it("rates two genera by the share of traits they have in common", () => {
    const first = new Set(["lifestyle:ectomycorrhizal", "aquatic habitat:non-aquatic"]);
    const second = new Set(["lifestyle:wood_saprotroph", "aquatic habitat:non-aquatic"]);
    expect(compareFungalTraits(first, second)).toBeCloseTo(1 / 3);
  });
});
