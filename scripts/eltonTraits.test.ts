import { describe, expect, it } from "vitest";
import { compareEltonTraits, parseEltonTraits } from "./eltonTraits.ts";

const dietColumns = [
  "Diet-Inv",
  "Diet-Vend",
  "Diet-Vect",
  "Diet-Vfish",
  "Diet-Vunk",
  "Diet-Scav",
  "Diet-Fruit",
  "Diet-Nect",
  "Diet-Seed",
  "Diet-PlantO",
];
const header = ["Scientific", "English", ...dietColumns, "BodyMass-Value"].join("\t");

function makeTable(...rows: string[][]) {
  return [header, ...rows.map((row) => row.join("\t")), ""].join("\r\n");
}

const ostrich = ["Struthio camelus", "Ostrich", "10", "0", "0", "0", "10", "0", "0", "0", "30"];
const ostrichRow = [...ostrich, "50", "111000"];

describe("parseEltonTraits", () => {
  it("reads the diet as fractions", () => {
    const [record] = parseEltonTraits(makeTable(ostrichRow), "bird");
    expect(record?.traits.diet).toEqual([0.1, 0, 0, 0, 0.1, 0, 0, 0, 0.3, 0.5]);
  });

  it("reads the body mass in grams as its base-10 logarithm", () => {
    const [record] = parseEltonTraits(makeTable(ostrichRow), "bird");
    expect(record?.traits.log10Mass).toBeCloseTo(5.045);
  });

  it("keeps the English name", () => {
    const [record] = parseEltonTraits(makeTable(ostrichRow), "bird");
    expect(record?.names).toEqual([{ language: "en", name: "Ostrich" }]);
  });

  it("hints the class to GBIF", () => {
    const [record] = parseEltonTraits(makeTable(ostrichRow), "mammal");
    expect(record?.gbifHints).toEqual({ kingdom: "Animalia", class: "Mammalia" });
  });

  it("skips rows without a name", () => {
    expect(parseEltonTraits(makeTable(ostrichRow, Array(13).fill("")), "bird")).toHaveLength(1);
  });

  it("skips rows whose diet is unknown", () => {
    const unknownDiet = ["Mystacina robusta", "", ...Array(10).fill("0"), "13"];
    expect(parseEltonTraits(makeTable(unknownDiet), "mammal")).toHaveLength(0);
  });
});

describe("compareEltonTraits", () => {
  const vulture = { diet: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], log10Mass: 4 };

  it("rates identical traits as 1", () => {
    expect(compareEltonTraits(vulture, vulture)).toBe(1);
  });

  it("rates a disjoint diet at a thousandfold mass difference as 0", () => {
    const hummingbird = { diet: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], log10Mass: 1 };
    expect(compareEltonTraits(vulture, hummingbird)).toBe(0);
  });

  it("averages diet overlap and closeness of mass", () => {
    const halfScavenger = { diet: [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0], log10Mass: 5.5 };
    expect(compareEltonTraits(vulture, halfScavenger)).toBeCloseTo(0.5);
  });
});
