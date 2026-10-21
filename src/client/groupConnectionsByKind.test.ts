import { describe, expect, it } from "vitest";
import type { Connection } from "../shared/graph";
import { groupConnectionsByKind } from "./groupConnectionsByKind";

const baseConnection = {
  id: 0,
  direction: "outgoing",
  neighborId: "pine",
  kind: "interaction",
  relation: "mutualistOf",
  basis: "observed",
  taxonomicLevel: null,
  weight: null,
  place: null,
  latitude: null,
  longitude: null,
  date: null,
  source: "mangal",
  licence: "CC-BY-4.0",
  qualityFlags: [],
  sources: [],
} satisfies Connection;

function connectionWith(fields: Partial<Connection>) {
  return { ...baseConnection, ...fields } satisfies Connection;
}

const names: Record<string, string> = { pine: "pine", oak: "oak", word: "matsu" };
const nameOf = (nodeId: string) => names[nodeId] ?? nodeId;

describe("groupConnectionsByKind", () => {
  it("orders the kinds as the vocabulary does", () => {
    const groups = groupConnectionsByKind(
      [
        connectionWith({ id: 1, kind: "shared_words_and_stories" }),
        connectionWith({ id: 2, kind: "interaction" }),
      ],
      nameOf,
    );
    expect(groups.map((group) => group.kind)).toEqual(["interaction", "shared_words_and_stories"]);
  });

  it("counts the connections of each kind", () => {
    const groups = groupConnectionsByKind(
      [
        connectionWith({ id: 1 }),
        connectionWith({ id: 2, relation: "eats" }),
        connectionWith({ id: 3, kind: "likeness" }),
      ],
      nameOf,
    );
    expect(groups.map((group) => group.count)).toEqual([2, 1]);
  });

  it("orders the relations within a kind by their words", () => {
    const [group] = groupConnectionsByKind(
      [connectionWith({ id: 1, relation: "visitsFlowersOf" }), connectionWith({ id: 2 })],
      nameOf,
    );
    expect(group?.relationGroups.map((relationGroup) => relationGroup.relation)).toEqual([
      "mutualistOf",
      "visitsFlowersOf",
    ]);
  });

  it("separates the two directions of a relation", () => {
    const [group] = groupConnectionsByKind(
      [connectionWith({ id: 1, direction: "incoming" }), connectionWith({ id: 2 })],
      nameOf,
    );
    expect(group?.relationGroups.map((relationGroup) => relationGroup.direction)).toEqual([
      "outgoing",
      "incoming",
    ]);
  });

  it("orders the connections within a relation by the neighbour's name", () => {
    const [group] = groupConnectionsByKind(
      [connectionWith({ id: 1 }), connectionWith({ id: 2, neighborId: "oak" })],
      nameOf,
    );
    expect(group?.relationGroups[0]?.connections.map((connection) => connection.id)).toEqual([
      2, 1,
    ]);
  });

  it("leaves out kinds without connections", () => {
    expect(groupConnectionsByKind([], nameOf)).toEqual([]);
  });
});
