import type { ConnectionBasis, ConnectionKind, GraphNode } from "./graph";
import type { QualityFlag } from "./qualityFlags";

/** A connection between two nodes, with only the fields needed to search and filter the graph. */
export type GraphEdge = {
  id: number;
  sourceNodeId: string;
  targetNodeId: string;
  kind: ConnectionKind;
  relation: string;
  basis: ConnectionBasis;
  source: string;
  licence: string;
  qualityFlags: QualityFlag[];
};

/** The whole graph in a compact form, which a browser can search without a server. */
export type GraphExport = {
  nodes: Omit<GraphNode, "names">[];
  edges: GraphEdge[];
};
