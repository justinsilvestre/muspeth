import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { listNodeDetails } from "./listNodeDetails";

const pine = {
  id: "pine",
  kind: "organism",
  label: "Pinus densiflora",
  names: [
    { language: "en", name: "Japanese red pine" },
    { language: "ja", name: "アカマツ" },
  ],
} satisfies GraphNode;

const matsu = {
  id: "word:ja:マツ",
  kind: "word",
  label: "マツ",
  names: [{ language: "ja", name: "マツ" }],
} satisfies GraphNode;

describe("listNodeDetails", () => {
  it("gives an organism's scientific label, marked as scientific", () => {
    expect(listNodeDetails(pine, false)).toEqual([
      { text: "Pinus densiflora", isScientific: true },
    ]);
  });

  it("leaves out a scientific label that is already the display name", () => {
    expect(listNodeDetails({ ...pine, names: [] }, false)).toEqual([]);
  });

  it("gives a word's language", () => {
    expect(listNodeDetails(matsu, false)).toEqual([{ text: "Japanese", isScientific: false }]);
  });

  it("gives the matched name when it is not otherwise shown", () => {
    expect(listNodeDetails(pine, false, "アカマツ")).toContainEqual({
      text: "アカマツ",
      isScientific: false,
    });
  });

  it("leaves out the matched name when it is the display name", () => {
    expect(listNodeDetails(pine, false, "Japanese red pine")).toHaveLength(1);
  });

  it("leaves out the matched name when it differs from the display name only in letter case", () => {
    expect(listNodeDetails(pine, false, "japanese RED pine")).toHaveLength(1);
  });

  it("gives the node's ID when its display name is shared", () => {
    expect(listNodeDetails(matsu, true).at(-1)).toEqual({
      text: "word:ja:マツ",
      isScientific: false,
    });
  });

  it("does not mark a compound's label as scientific", () => {
    const compound = { id: "c", kind: "compound", label: "pinene", names: [] } satisfies GraphNode;
    expect(listNodeDetails(compound, false, "pinene")).toEqual([]);
  });
});
