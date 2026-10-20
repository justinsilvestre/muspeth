import type { GraphEdge } from "../shared/graphExport";

/** The columns of the `connections` table that make up a `GraphEdge`. */
export const graphEdgeColumns =
  "id, source_node_id, target_node_id, kind, relation, basis, source, quality_flags";

export type GraphEdgeRow = {
  id: number;
  source_node_id: string;
  target_node_id: string;
  kind: GraphEdge["kind"];
  relation: string;
  basis: GraphEdge["basis"];
  source: string;
  quality_flags: string;
};

export function toGraphEdge(row: GraphEdgeRow) {
  return {
    id: row.id,
    sourceNodeId: row.source_node_id,
    targetNodeId: row.target_node_id,
    kind: row.kind,
    relation: row.relation,
    basis: row.basis,
    source: row.source,
    qualityFlags: JSON.parse(row.quality_flags),
  } satisfies GraphEdge;
}
