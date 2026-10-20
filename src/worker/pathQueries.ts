import type { ConnectionFilter } from "../shared/connectionFilter";
import { findPaths } from "../shared/findPaths";
import type { GraphEdge } from "../shared/graphExport";
import { buildPathGraph } from "../shared/pathGraph";
import type { PathQuery } from "../shared/pathQuery";
import { connectionFilterSql } from "./connectionFilterSql";
import { type GraphEdgeRow, graphEdgeColumns, toGraphEdge } from "./graphEdgeRow";
import { isOneOf } from "./sqlCondition";

/**
 * Finds the best paths between two nodes, loading only the part of the graph they can pass through.
 * Every connection on a path of n steps touches a node fewer than n/2 steps from one end or the other.
 */
export async function findPathsBetween(db: D1Database, query: PathQuery) {
  const ends = [query.fromId, query.toId];
  const edges = await loadEdgesAround(db, ends, Math.ceil(query.maxSteps / 2), query.filter);
  const degrees = await countNeighbors(db, listNodeIds(edges), query.filter);
  const graph = buildPathGraph(edges, degrees);
  return findPaths(graph, query.fromId, query.toId, {
    limit: query.limit,
    maxSteps: query.maxSteps,
  });
}

/** Loads the connections of the given nodes, then those of their neighbours, for `rounds` rounds. */
async function loadEdgesAround(
  db: D1Database,
  nodeIds: string[],
  rounds: number,
  filter: ConnectionFilter,
) {
  const edgesById = new Map<number, GraphEdge>();
  const seenNodeIds = new Set(nodeIds);
  let frontier = nodeIds;
  for (let round = 0; round < rounds && frontier.length > 0; round++) {
    const edges = await loadEdgesTouching(db, frontier, filter);
    for (const edge of edges) edgesById.set(edge.id, edge);
    frontier = listNodeIds(edges).filter((id) => !seenNodeIds.has(id));
    for (const id of frontier) seenNodeIds.add(id);
  }
  // Ordering by ID builds the same adjacency list as the whole graph would, so ties break alike.
  return [...edgesById.values()].sort((a, b) => a.id - b.id);
}

async function loadEdgesTouching(db: D1Database, nodeIds: string[], filter: ConnectionFilter) {
  const condition = connectionFilterSql(filter);
  const select = (column: string) => {
    const touching = isOneOf(column, nodeIds);
    return {
      sql: `SELECT ${graphEdgeColumns} FROM connections WHERE ${touching.sql} AND ${condition.sql}`,
      bindings: [...touching.bindings, ...condition.bindings],
    };
  };
  const [bySource, byTarget] = [select("source_node_id"), select("target_node_id")];
  const { results } = await db
    .prepare(`${bySource.sql} UNION ${byTarget.sql} ORDER BY id`)
    .bind(...bySource.bindings, ...byTarget.bindings)
    .all<GraphEdgeRow>();
  return results.map(toGraphEdge);
}

/** Counts each node's distinct neighbours across the whole graph, among connections passing the filter. */
async function countNeighbors(db: D1Database, nodeIds: string[], filter: ConnectionFilter) {
  const condition = connectionFilterSql(filter);
  const [bySource, byTarget] = [
    isOneOf("source_node_id", nodeIds),
    isOneOf("target_node_id", nodeIds),
  ];
  const { results } = await db
    .prepare(
      `SELECT node_id, COUNT(DISTINCT neighbor_id) AS degree FROM (
        SELECT source_node_id AS node_id, target_node_id AS neighbor_id FROM connections
          WHERE ${bySource.sql} AND ${condition.sql}
        UNION ALL
        SELECT target_node_id, source_node_id FROM connections
          WHERE ${byTarget.sql} AND ${condition.sql}
      ) WHERE node_id <> neighbor_id GROUP BY node_id`,
    )
    .bind(...bySource.bindings, ...condition.bindings, ...byTarget.bindings, ...condition.bindings)
    .all<{ node_id: string; degree: number }>();
  return new Map(results.map(({ node_id, degree }) => [node_id, degree]));
}

function listNodeIds(edges: GraphEdge[]) {
  return [...new Set(edges.flatMap((edge) => [edge.sourceNodeId, edge.targetNodeId]))];
}
