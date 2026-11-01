import { describe, expect, it } from "vitest";
import { type IdentifiedRecord, mergeNamesakes } from "./traitNamesakes.ts";

function makeRecord(name: string, label: string, id: string) {
  return {
    name,
    node: { nodeId: id, qualityFlags: [] },
    draft: { id, kind: "organism", label, names: [] },
  } satisfies IdentifiedRecord;
}

const millet = makeRecord("Echinochloa crus-galli", "Echinochloa crus-galli", "wikidata:Q163527");
const synonym = makeRecord("Echinochloa esculenta", "Echinochloa crus-galli", "gbif:6313089");

describe("mergeNamesakes", () => {
  it("gives a synonym the node of the record bearing the accepted name", () => {
    expect(mergeNamesakes([synonym, millet])[0]?.node.nodeId).toBe("wikidata:Q163527");
  });

  it("gives two synonyms of a name no record bears the first one's node", () => {
    const other = makeRecord("Panicum crus-galli", "Echinochloa crus-galli", "gbif:1");
    expect(mergeNamesakes([synonym, other]).map(({ draft }) => draft.id)).toEqual([
      "gbif:6313089",
      "gbif:6313089",
    ]);
  });

  it("leaves records with distinct labels alone", () => {
    const tef = makeRecord("Eragrostis tef", "Eragrostis tef", "wikidata:Q843942");
    expect(mergeNamesakes([millet, tef])).toEqual([millet, tef]);
  });
});
