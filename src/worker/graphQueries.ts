import type { Connection, GraphNode, NodeName } from "../shared/graph";

type NodeRow = Omit<GraphNode, "names">;
type NodeNameRow = NodeName & { node_id: string };
type ConnectionRow = {
  id: number;
  source_node_id: string;
  target_node_id: string;
  kind: string;
  relation: string;
  basis: string;
  source: string;
  citation: string | null;
  licence: string;
  quality_flags: string;
};

export async function listNodes(db: D1Database) {
  const [nodes, names] = await Promise.all([
    db.prepare("SELECT id, kind, label FROM nodes ORDER BY label").all<NodeRow>(),
    db
      .prepare("SELECT node_id, language, name FROM node_names ORDER BY language, name")
      .all<NodeNameRow>(),
  ]);
  const namesByNodeId = Map.groupBy(names.results, (row) => row.node_id);
  return nodes.results.map(
    (node) =>
      ({
        ...node,
        names: (namesByNodeId.get(node.id) ?? []).map(({ language, name }) => ({ language, name })),
      }) satisfies GraphNode,
  );
}

export async function findNode(db: D1Database, nodeId: string) {
  return db.prepare("SELECT id, kind, label FROM nodes WHERE id = ?").bind(nodeId).first<NodeRow>();
}

/** Lists every connection that has the given node at either end. */
export async function listConnections(db: D1Database, nodeId: string) {
  const { results } = await db
    .prepare(
      "SELECT * FROM connections WHERE source_node_id = ?1 OR target_node_id = ?1 ORDER BY id",
    )
    .bind(nodeId)
    .all<ConnectionRow>();
  return results.map((row) => toConnection(row, nodeId));
}

function toConnection(row: ConnectionRow, nodeId: string) {
  const isOutgoing = row.source_node_id === nodeId;
  return {
    id: row.id,
    direction: isOutgoing ? "outgoing" : "incoming",
    neighborId: isOutgoing ? row.target_node_id : row.source_node_id,
    kind: row.kind,
    relation: row.relation,
    basis: row.basis,
    source: row.source,
    citation: row.citation,
    licence: row.licence,
    qualityFlags: JSON.parse(row.quality_flags),
  } satisfies Connection;
}
