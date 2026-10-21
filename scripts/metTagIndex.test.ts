import { describe, expect, it } from "vitest";
import { addToMetTagIndex, createMetTagIndex, listMetCandidates } from "./metTagIndex.ts";
import type { MuseumOrganism } from "./museumNames.ts";

const honeyBee = {
  id: "wikidata:Q30034",
  label: "Apis mellifera",
  englishNames: ["honey bee"],
  ancestors: [{ qid: "Q7391", names: ["bee"] }],
} satisfies MuseumOrganism;

function makeRow(objectId: number, tags: string, urls: string, isPublicDomain = "True") {
  return {
    "Object ID": String(objectId),
    "Is Public Domain": isPublicDomain,
    Tags: tags,
    "Tags Wikidata URL": urls,
  };
}

function indexRows(rows: Record<string, string>[]) {
  const index = createMetTagIndex();
  for (const row of rows) addToMetTagIndex(index, row);
  return index;
}

describe("listMetCandidates", () => {
  it("finds an object whose tag carries the organism's Wikidata item", () => {
    const index = indexRows([makeRow(1, "Honey bees", "https://www.wikidata.org/wiki/Q30034")]);
    expect(listMetCandidates(index, honeyBee)).toEqual([{ objectId: 1, by: "id" }]);
  });

  it("finds an object whose tag carries an ancestor's Wikidata item", () => {
    const index = indexRows([makeRow(1, "Bees", "https://www.wikidata.org/wiki/Q7391")]);
    expect(listMetCandidates(index, honeyBee)).toEqual([{ objectId: 1, by: "ancestor" }]);
  });

  it("finds an object whose tag names the organism, as a text match", () => {
    const index = indexRows([makeRow(1, "Honey Bees", "")]);
    expect(listMetCandidates(index, honeyBee)).toEqual([
      { objectId: 1, by: { name: "honey bee", kind: "common" } },
    ]);
  });

  it("reads the Wikidata item of each of several tags", () => {
    const index = indexRows([
      makeRow(
        1,
        "Flowers|Bees",
        "https://www.wikidata.org/wiki/Q506|https://www.wikidata.org/wiki/Q7391",
      ),
    ]);
    expect(listMetCandidates(index, honeyBee)).toHaveLength(1);
  });

  it("leaves out objects that are not in the public domain", () => {
    const index = indexRows([makeRow(1, "Bees", "https://www.wikidata.org/wiki/Q7391", "False")]);
    expect(listMetCandidates(index, honeyBee)).toEqual([]);
  });

  it("lists matches by identifier first, then by the Met's numbers", () => {
    const index = indexRows([
      makeRow(3, "Bees", "https://www.wikidata.org/wiki/Q7391"),
      makeRow(2, "Bees", "https://www.wikidata.org/wiki/Q7391"),
      makeRow(9, "Honey bees", "https://www.wikidata.org/wiki/Q30034"),
    ]);
    expect(listMetCandidates(index, honeyBee).map(({ objectId }) => objectId)).toEqual([9, 2, 3]);
  });
});
