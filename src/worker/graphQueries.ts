import { type ConnectionFilter, emptyConnectionFilter } from "../shared/connectionFilter";
import type { Connection, ConnectionSource, GraphNode, NodeMedia, NodeName } from "../shared/graph";
import { connectionFilterSql } from "./connectionFilterSql";

type NodeRow = Omit<GraphNode, "names">;
type NodeNameRow = NodeName & { node_id: string };
type ConnectionRow = {
  id: number;
  source_node_id: string;
  target_node_id: string;
  kind: Connection["kind"];
  relation: string;
  basis: Connection["basis"];
  taxonomic_level: string | null;
  weight: number | null;
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  source: string;
  licence: string;
  quality_flags: string;
};
type NodeMediaRow = {
  id: string;
  media_url: string;
  media_licence: string;
  media_credit: string | null;
  media_page_url: string | null;
};
type ConnectionSourceRow = {
  connection_id: number;
  dataset_id: string | null;
  dataset_citation: string | null;
  study_citation: string | null;
  study_url: string | null;
  record_count: number | null;
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

/**
 * Lists every connection that has the given node at either end and passes the filter,
 * with the studies behind each.
 */
export async function listConnections(
  db: D1Database,
  nodeId: string,
  filter: ConnectionFilter = emptyConnectionFilter,
) {
  const condition = connectionFilterSql(filter);
  const matching = `(source_node_id = ? OR target_node_id = ?) AND ${condition.sql}`;
  const bindings = [nodeId, nodeId, ...condition.bindings];
  const [connections, sources] = await Promise.all([
    db
      .prepare(`SELECT * FROM connections WHERE ${matching} ORDER BY id`)
      .bind(...bindings)
      .all<ConnectionRow>(),
    db
      .prepare(
        `SELECT * FROM connection_sources WHERE connection_id IN
          (SELECT id FROM connections WHERE ${matching})
        ORDER BY dataset_id, record_count DESC, rowid`,
      )
      .bind(...bindings)
      .all<ConnectionSourceRow>(),
  ]);
  const sourcesByConnectionId = Map.groupBy(sources.results, (row) => row.connection_id);
  return connections.results.map((row) =>
    toConnection(row, nodeId, (sourcesByConnectionId.get(row.id) ?? []).map(toConnectionSource)),
  );
}

/**
 * Gives the images of a node and of its neighbours along the connections that pass the filter,
 * keyed by node ID. Nodes without an image are left out.
 */
export async function listConnectionMedia(
  db: D1Database,
  nodeId: string,
  filter: ConnectionFilter = emptyConnectionFilter,
) {
  const condition = connectionFilterSql(filter);
  const rows = await db
    .prepare(
      `SELECT id, media_url, media_licence, media_credit, media_page_url FROM nodes
      WHERE media_url IS NOT NULL AND media_licence IS NOT NULL AND (id = ? OR id IN (
        SELECT CASE WHEN source_node_id = ? THEN target_node_id ELSE source_node_id END
        FROM connections WHERE (source_node_id = ? OR target_node_id = ?) AND ${condition.sql}
      ))`,
    )
    .bind(nodeId, nodeId, nodeId, nodeId, ...condition.bindings)
    .all<NodeMediaRow>();
  return Object.fromEntries(rows.results.map((row) => [row.id, toNodeMedia(row)]));
}

function toNodeMedia(row: NodeMediaRow) {
  return {
    url: row.media_url,
    licence: row.media_licence,
    credit: row.media_credit,
    pageUrl: row.media_page_url,
  } satisfies NodeMedia;
}

function toConnection(row: ConnectionRow, nodeId: string, sources: ConnectionSource[]) {
  const isOutgoing = row.source_node_id === nodeId;
  return {
    id: row.id,
    direction: isOutgoing ? "outgoing" : "incoming",
    neighborId: isOutgoing ? row.target_node_id : row.source_node_id,
    kind: row.kind,
    relation: row.relation,
    basis: row.basis,
    taxonomicLevel: row.taxonomic_level,
    weight: row.weight,
    place: row.place,
    latitude: row.latitude,
    longitude: row.longitude,
    date: row.date,
    source: row.source,
    licence: row.licence,
    qualityFlags: JSON.parse(row.quality_flags),
    sources,
  } satisfies Connection;
}

function toConnectionSource(row: ConnectionSourceRow) {
  return {
    datasetId: row.dataset_id,
    datasetCitation: row.dataset_citation,
    studyCitation: row.study_citation,
    studyUrl: row.study_url,
    recordCount: row.record_count,
  } satisfies ConnectionSource;
}
