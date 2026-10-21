import { describe, expect, it } from "vitest";
import type { GraphEdge } from "../../shared/graphExport";
import { foldStepConnections } from "./foldStepConnections";

function connection(id: number, sourceNodeId: string, targetNodeId: string) {
  return {
    id,
    sourceNodeId,
    targetNodeId,
    kind: "interaction",
    relation: "symbiontOf",
    basis: "observed",
    source: "test",
    licence: "CC0-1.0",
    qualityFlags: [],
  } satisfies GraphEdge;
}

function foldStep(...connections: GraphEdge[]) {
  return foldStepConnections({ fromNodeId: "a", toNodeId: "b", connections });
}

describe("foldStepConnections", () => {
  it("shows first a connection that runs in the direction of the path", () => {
    expect(foldStep(connection(1, "b", "a"), connection(2, "a", "b")).shown?.id).toBe(2);
  });

  it("shows the first connection when none runs in the direction of the path", () => {
    expect(foldStep(connection(1, "b", "a"), connection(2, "b", "a")).shown?.id).toBe(1);
  });

  it("folds the other connections in their stored order", () => {
    const { folded } = foldStep(
      connection(1, "b", "a"),
      connection(2, "a", "b"),
      connection(3, "b", "a"),
    );
    expect(folded.map(({ id }) => id)).toEqual([1, 3]);
  });

  it("folds nothing when the step has one connection", () => {
    expect(foldStep(connection(1, "a", "b")).folded).toEqual([]);
  });
});
