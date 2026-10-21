import { describe, expect, it } from "vitest";
import type { GraphEdge } from "../../shared/graphExport";
import { describeChainLink } from "./describeChainLink";

const edge = {
  id: 1,
  sourceNodeId: "a",
  targetNodeId: "b",
  kind: "interaction",
  relation: "mutualistOf",
  basis: "observed",
  source: "globi",
  licence: "CC-BY-4.0",
  qualityFlags: [],
} satisfies GraphEdge;

function describeStep(connection: GraphEdge) {
  return describeChainLink({ fromNodeId: "a", toNodeId: "b", connections: [connection] });
}

describe("describeChainLink", () => {
  it("colours the link by the kind of the connection it shows", () => {
    expect(describeStep({ ...edge, kind: "likeness" })?.kind).toBe("likeness");
  });

  it("points the relation forwards when the connection runs along the path", () => {
    expect(describeStep(edge)?.label).toBe("mutualist of →");
  });

  it("points the relation backwards when the connection runs against the path", () => {
    expect(describeStep({ ...edge, sourceNodeId: "b", targetNodeId: "a" })?.label).toBe(
      "← mutualist of",
    );
  });

  it("draws an observed connection as a solid line", () => {
    expect(describeStep(edge)?.dashed).toBe(false);
  });

  it("draws a computed connection as a dashed line", () => {
    expect(describeStep({ ...edge, basis: "computed" })?.dashed).toBe(true);
  });

  it("describes nothing for a step without connections", () => {
    expect(describeChainLink({ fromNodeId: "a", toNodeId: "b", connections: [] })).toBeUndefined();
  });
});
