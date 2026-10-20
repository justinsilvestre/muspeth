import { env } from "cloudflare:test";
import type { Connection } from "../../shared/graph";

type ConnectionFixture = Partial<
  Pick<
    Connection,
    "kind" | "basis" | "source" | "qualityFlags" | "place" | "latitude" | "longitude" | "date"
  >
> & {
  id: number;
  sourceNodeId: string;
  targetNodeId: string;
};

/**
 * Inserts connections, by default observed interactions from the source "test",
 * along with an organism node for each end that does not exist yet.
 */
export async function insertConnections(connections: ConnectionFixture[]) {
  const nodeIds = new Set(connections.flatMap((c) => [c.sourceNodeId, c.targetNodeId]));
  await env.DB.batch([
    ...[...nodeIds].map((id) =>
      env.DB.prepare(
        "INSERT OR IGNORE INTO nodes (id, kind, label) VALUES (?, 'organism', ?)",
      ).bind(id, id),
    ),
    ...connections.map(insertConnection),
  ]);
}

function insertConnection(connection: ConnectionFixture) {
  return env.DB.prepare(
    `INSERT INTO connections (id, source_node_id, target_node_id, kind, relation, basis, place, latitude, longitude, date, source, licence, quality_flags)
     VALUES (?, ?, ?, ?, 'relatedTo', ?, ?, ?, ?, ?, ?, 'CC0-1.0', ?)`,
  ).bind(
    connection.id,
    connection.sourceNodeId,
    connection.targetNodeId,
    connection.kind ?? "interaction",
    connection.basis ?? "observed",
    connection.place ?? null,
    connection.latitude ?? null,
    connection.longitude ?? null,
    connection.date ?? null,
    connection.source ?? "test",
    JSON.stringify(connection.qualityFlags ?? []),
  );
}

/** Joins each pair of consecutive nodes with an interaction, numbering connections from `firstId`. */
export function chain(nodeIds: string[], firstId: number) {
  return nodeIds.slice(1).map((targetNodeId, index) => ({
    id: firstId + index,
    sourceNodeId: nodeIds[index] ?? "",
    targetNodeId,
  }));
}
