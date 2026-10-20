import { describe, expect, it } from "vitest";
import { selectTraitNeighbours } from "./traitNeighbours.ts";
import type { TraitRecord } from "./traitRecord.ts";

function makeRecord(name: string, traits: number, group = "bird") {
  return { name, group, traits, names: [], gbifHints: {} } satisfies TraitRecord<number>;
}

function compare(first: number, second: number) {
  return Math.max(0, 1 - Math.abs(first - second));
}

function selectNames(records: TraitRecord<number>[], graphNames: string[] = []) {
  const [subject, ...others] = records;
  if (!subject) throw new Error("No subject");
  return selectTraitNeighbours(subject, [subject, ...others], compare, (name) =>
    graphNames.includes(name),
  ).map(({ record }) => record.name);
}

const owl = makeRecord("owl", 0.5);
const birds = [0.4, 0.46, 0.53, 0.62, 0.7].map((traits, i) => makeRecord(`bird ${i}`, traits));

describe("selectTraitNeighbours", () => {
  it("keeps the three nearest of all records", () => {
    expect(selectNames([owl, ...birds])).toEqual(["bird 2", "bird 1", "bird 0"]);
  });

  it("adds the nearest record of another group", () => {
    const mink = makeRecord("mink", 0.2, "mammal");
    expect(selectNames([owl, ...birds, mink])).toContain("mink");
  });

  it("adds the nearest record already in the graph", () => {
    expect(selectNames([owl, ...birds], ["bird 4"])).toContain("bird 4");
  });

  it("prefers records already in the graph among equally near ones", () => {
    const twins = ["a", "b", "c", "d"].map((name) => makeRecord(name, 0.6));
    expect(selectNames([owl, ...twins], ["d"])).toContain("d");
  });

  it("leaves out the subject itself", () => {
    expect(selectNames([owl, makeRecord("owl", 0.5)])).toEqual([]);
  });

  it("leaves out records with nothing in common", () => {
    expect(selectNames([owl, makeRecord("far", 3)])).toEqual([]);
  });

  it("lists a record picked for several reasons once", () => {
    const mink = makeRecord("mink", 0.5, "mammal");
    expect(selectNames([owl, mink], ["mink"])).toEqual(["mink"]);
  });

  describe("when a record left out is as near as one kept", () => {
    const twins = ["a", "b", "c", "d"].map((name) => makeRecord(name, 0.6));
    const neighbours = selectTraitNeighbours(owl, twins, compare, () => false);

    it("marks the kept record as tied", () => {
      expect(neighbours.every(({ isTied }) => isTied)).toBe(true);
    });
  });

  describe("when no record left out is as near as one kept", () => {
    const neighbours = selectTraitNeighbours(owl, birds, compare, () => false);

    it("marks no record as tied", () => {
      expect(neighbours.some(({ isTied }) => isTied)).toBe(false);
    });
  });
});
