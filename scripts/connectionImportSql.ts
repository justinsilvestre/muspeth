import type { ConnectionSource, NodeName } from "../src/shared/graph.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { quoteSql } from "./quoteSql.ts";

/**
 * The most characters of listed values in one statement.
 * It keeps statements under D1's limit of 100 kB even when every character takes three bytes.
 */
const maxListLength = 30_000;

/**
 * Writes SQL that replaces what an earlier run of the same import wrote.
 * It removes that run's connections and their sources, and the nodes it added that this run does
 * not, then adds this run's nodes and connections under `source`.
 * Nodes that the seed or other imports added keep their label and media, and may gain names.
 * An earlier node that other imports still connect is handed to one of them instead of removed.
 */
export function toConnectionImportSql(
  source: string,
  nodes: NodeDraft[],
  connections: ConnectionDraft[],
  previousNodeIds: string[] = [],
) {
  const uniqueNodes = [...new Map(nodes.map((node) => [node.id, node])).values()];
  const nodeIds = new Set(uniqueNodes.map(({ id }) => id));
  const staleIds = previousNodeIds.filter((id) => !nodeIds.has(id));
  return [
    `DELETE FROM connection_sources WHERE connection_id IN (SELECT id FROM connections WHERE source = ${quoteSql(source)});`,
    `DELETE FROM connections WHERE source = ${quoteSql(source)};`,
    ...splitIntoBatches(staleIds.map(quoteSql)).flatMap((ids) => toStaleNodesSql(source, ids)),
    ...uniqueNodes.map((node) => toNodeSql(source, node)),
    ...nodes.flatMap(({ id, names }) => names.map((name) => toNodeNameSql(id, name))),
    ...connections.flatMap((connection) => toConnectionSql(source, connection)),
  ].join("\n");
}

/** Groups SQL values so that each group can be listed in one statement. */
function splitIntoBatches(values: string[]) {
  const batches: string[][] = [];
  let length = Infinity;
  for (const value of values) {
    if (length + value.length > maxListLength) {
      batches.push([]);
      length = 0;
    }
    batches.at(-1)?.push(value);
    length += value.length;
  }
  return batches;
}

function toStaleNodesSql(source: string, quotedIds: string[]) {
  const isStale = `source = ${quoteSql(source)} AND id IN (${quotedIds.join(", ")})`;
  const isConnected =
    "connections.source_node_id = nodes.id OR connections.target_node_id = nodes.id";
  return [
    `UPDATE nodes SET source = (SELECT connections.source FROM connections WHERE ${isConnected} ORDER BY connections.id LIMIT 1)
  WHERE ${isStale} AND EXISTS (SELECT 1 FROM connections WHERE ${isConnected});`,
    `DELETE FROM nodes WHERE ${isStale};`,
  ];
}

function toNodeSql(source: string, { id, kind, label, media }: NodeDraft) {
  const values = [id, kind, label, source, media?.url ?? null, media?.licence ?? null];
  return `INSERT INTO nodes (id, kind, label, source, media_url, media_licence)
  VALUES (${values.map(quoteSql).join(", ")})
  ON CONFLICT (id) DO UPDATE SET label = excluded.label, media_url = excluded.media_url, media_licence = excluded.media_licence
  WHERE nodes.source = excluded.source;`;
}

function toNodeNameSql(nodeId: string, { language, name }: NodeName) {
  const values = [nodeId, language, name].map(quoteSql).join(", ");
  return `INSERT OR IGNORE INTO node_names (node_id, language, name) VALUES (${values});`;
}

function toConnectionSql(source: string, connection: ConnectionDraft) {
  const values = [
    connection.sourceNodeId,
    connection.targetNodeId,
    connection.kind,
    connection.relation,
    connection.basis,
    connection.taxonomicLevel,
    connection.weight ?? null,
    connection.place ?? null,
    connection.latitude ?? null,
    connection.longitude ?? null,
    connection.date ?? null,
    source,
    connection.licence,
    JSON.stringify(connection.qualityFlags),
  ];
  return [
    `INSERT INTO connections (source_node_id, target_node_id, kind, relation, basis, taxonomic_level, weight, place, latitude, longitude, date, source, licence, quality_flags)
  VALUES (${values.map(quoteSql).join(", ")});`,
    ...splitIntoBatches(connection.sources.map(toConnectionSourceValues)).map(
      toConnectionSourcesSql,
    ),
  ];
}

/**
 * Credits the studies to the connection inserted just before them.
 * SQLite gives a new row an ID one above the largest so far, so the largest ID is that connection's.
 */
function toConnectionSourcesSql(rows: string[]) {
  return `INSERT INTO connection_sources (connection_id, dataset_id, dataset_citation, study_citation, study_url, record_count)
  SELECT (SELECT MAX(id) FROM connections), studies.* FROM (VALUES ${rows.join(", ")}) AS studies;`;
}

function toConnectionSourceValues(study: ConnectionSource) {
  const values = [
    study.datasetId,
    study.datasetCitation,
    study.studyCitation,
    study.studyUrl,
    study.recordCount,
  ];
  return `(${values.map(quoteSql).join(", ")})`;
}
