import type { ConnectionFilter } from "../shared/connectionFilter";
import type { GraphExport } from "../shared/graphExport";
import { connectionFilterSql } from "./connectionFilterSql";
import { type GraphEdgeRow, graphEdgeColumns, toGraphEdge } from "./graphEdgeRow";
import type { SqlDatabase } from "./sqlDatabase";

/** Returns every node, and every connection that passes the filter, in a compact form. */
export async function exportGraph(db: SqlDatabase, filter: ConnectionFilter) {
  const condition = connectionFilterSql(filter);
  const [nodes, edges] = await Promise.all([
    db.prepare("SELECT id, kind, label FROM nodes ORDER BY id").all<GraphExport["nodes"][number]>(),
    db
      .prepare(`SELECT ${graphEdgeColumns} FROM connections WHERE ${condition.sql} ORDER BY id`)
      .bind(...condition.bindings)
      .all<GraphEdgeRow>(),
  ]);
  return { nodes: nodes.results, edges: edges.results.map(toGraphEdge) } satisfies GraphExport;
}

/** Lists the name of every source that connections come from, such as "globi". */
export async function listConnectionSourceNames(db: SqlDatabase) {
  const { results } = await db
    .prepare("SELECT DISTINCT source FROM connections ORDER BY source")
    .all<{ source: string }>();
  return results.map(({ source }) => source);
}
