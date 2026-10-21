import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { createNodeSearchIndex, searchNodes } from "./searchNodes";

function organism(id: string, label: string, names: GraphNode["names"] = []) {
  return { id, kind: "organism", label, names } satisfies GraphNode;
}

const pine = organism("pine", "Pinus densiflora", [
  { language: "en", name: "Japanese red pine" },
  { language: "ja", name: "アカマツ" },
]);
const pineapple = organism("pineapple", "Ananas comosus", [{ language: "en", name: "pineapple" }]);
const pinewoodNematode = organism("nematode", "Bursaphelenchus xylophilus", [
  { language: "en", name: "pinewood nematode" },
]);
const redSpruce = organism("red", "Picea rubens", [{ language: "en", name: "red spruce" }]);
const pinene = { id: "pinene", kind: "compound", label: "pinene", names: [] } satisfies GraphNode;

function searchIds(nodes: GraphNode[], query: string, kind?: GraphNode["kind"]) {
  return searchNodes(createNodeSearchIndex(nodes), query, kind).map(({ node }) => node.id);
}

describe("searchNodes", () => {
  it("finds a node by a name in any language", () => {
    expect(searchIds([pine, pineapple], "アカマツ")).toEqual(["pine"]);
  });

  it("finds a node by its label", () => {
    expect(searchIds([pine, pineapple], "densiflora")).toEqual(["pine"]);
  });

  it("ignores letter case", () => {
    expect(searchIds([pine], "JAPANESE")).toEqual(["pine"]);
  });

  it("ignores surrounding spaces", () => {
    expect(searchIds([pine], "  red pine ")).toEqual(["pine"]);
  });

  it("puts an exact match before a prefix match", () => {
    expect(searchIds([pineapple, pinene], "pinene")).toEqual(["pinene"]);
  });

  it("puts a prefix match before a match at the start of a later word", () => {
    expect(searchIds([pine, redSpruce], "red")).toEqual(["red", "pine"]);
  });

  it("puts a match at the start of a word before one inside a word", () => {
    const blackSpruce = organism("black", "Picea mariana", [
      { language: "en", name: "blackspruce" },
    ]);
    expect(searchIds([blackSpruce, redSpruce], "spruce")).toEqual(["red", "black"]);
  });

  it("puts shorter names first among equally good matches", () => {
    expect(searchIds([pinewoodNematode, pinene, pineapple], "pine")).toEqual([
      "pinene",
      "pineapple",
      "nematode",
    ]);
  });

  it("reports the name that matched", () => {
    const [match] = searchNodes(createNodeSearchIndex([pine]), "アカ");
    expect(match?.matchedName).toBe("アカマツ");
  });

  it("keeps only nodes of the given kind", () => {
    expect(searchIds([pine, pinene], "pine", "compound")).toEqual(["pinene"]);
  });

  describe("with an empty query", () => {
    it("lists the nodes of the given kind by display name", () => {
      expect(searchIds([pinewoodNematode, pinene, pine], "", "organism")).toEqual([
        "pine",
        "nematode",
      ]);
    });

    it("lists every node when no kind is given", () => {
      expect(searchIds([pine, pinene], " ")).toHaveLength(2);
    });
  });
});
