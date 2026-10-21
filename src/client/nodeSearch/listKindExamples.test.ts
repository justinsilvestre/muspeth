import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { listKindExamples } from "./listKindExamples";

function createNode(id: string, kind: GraphNode["kind"], nameCount = 0) {
  const names = Array.from({ length: nameCount }, (_, index) => ({
    language: "en",
    name: `${id} ${index}`,
  }));
  return { id, kind, label: id, names } satisfies GraphNode;
}

const quiet = createNode("quiet", "word");
const named = createNode("named", "word", 3);
const preferred = createNode("preferred", "word");

describe("listKindExamples", () => {
  it("puts the preferred nodes first", () => {
    expect(listKindExamples([quiet, named, preferred], [preferred], 2).word).toEqual([
      preferred,
      named,
    ]);
  });

  it("fills in with the nodes that have the most names", () => {
    expect(listKindExamples([quiet, named], [], 1).word).toEqual([named]);
  });

  it("lists no examples for a kind with no nodes", () => {
    expect(listKindExamples([quiet], [], 1).place).toEqual([]);
  });
});
