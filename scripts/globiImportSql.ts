import type { NodeName } from "../src/shared/graph.ts";
import type { ConnectionDraft } from "./globiConnections.ts";
import { quoteSql } from "./quoteSql.ts";

const source = "globi";
/** GloBI publishes its compiled data under CC0 and asks users to cite each original dataset. */
const licence = "CC0-1.0";

export type OrganismNode = { id: string; label: string; names: NodeName[] };

/**
 * Writes SQL that replaces the connections of any earlier GloBI import and adds the organisms they
 * link, leaving organisms that are already stored unchanged.
 * Nodes that an earlier GloBI import added and this one does not are removed.
 */
export function toGlobiImportSql(
  nodes: OrganismNode[],
  connections: ConnectionDraft[],
  previousNodeIds: string[] = [],
) {
  const uniqueNodes = [...new Map(nodes.map((node) => [node.id, node])).values()];
  const staleIds = previousNodeIds.filter((id) => !uniqueNodes.some((node) => node.id === id));
  return [
    `DELETE FROM connection_sources WHERE connection_id IN (SELECT id FROM connections WHERE source = ${quoteSql(source)});`,
    `DELETE FROM connections WHERE source = ${quoteSql(source)};`,
    ...(staleIds.length > 0
      ? [`DELETE FROM nodes WHERE id IN (${staleIds.map(quoteSql).join(", ")});`]
      : []),
    ...uniqueNodes.map(toNodeSql),
    ...uniqueNodes.flatMap(({ id, names }) => names.map((name) => toNodeNameSql(id, name))),
    ...connections.flatMap((connection) => [
      toConnectionSql(connection),
      ...(connection.sources.length > 0 ? [toConnectionSourcesSql(connection)] : []),
    ]),
  ].join("\n");
}

function toNodeSql({ id, label }: OrganismNode) {
  return `INSERT INTO nodes (id, kind, label) VALUES (${quoteSql(id)}, 'organism', ${quoteSql(label)})
  ON CONFLICT (id) DO NOTHING;`;
}

function toNodeNameSql(nodeId: string, { language, name }: NodeName) {
  const values = [nodeId, language, name].map(quoteSql).join(", ");
  return `INSERT OR IGNORE INTO node_names (node_id, language, name) VALUES (${values});`;
}

function toConnectionSql(connection: ConnectionDraft) {
  const values = [
    connection.sourceNodeId,
    connection.targetNodeId,
    "interaction",
    connection.relation,
    "observed",
    connection.taxonomicLevel,
    source,
    licence,
    JSON.stringify(connection.qualityFlags),
  ];
  return `INSERT INTO connections (source_node_id, target_node_id, kind, relation, basis, taxonomic_level, source, licence, quality_flags)
  VALUES (${values.map(quoteSql).join(", ")});`;
}

/** Matches the sources to their connection, which merging leaves as the only one of its kind. */
function toConnectionSourcesSql({
  sourceNodeId,
  targetNodeId,
  relation,
  sources,
}: ConnectionDraft) {
  const rows = sources.map((study) =>
    [study.datasetId, study.datasetCitation, study.studyCitation, study.studyUrl, study.recordCount]
      .map(quoteSql)
      .join(", "),
  );
  return `INSERT INTO connection_sources (connection_id, dataset_id, dataset_citation, study_citation, study_url, record_count)
  SELECT connections.id, studies.* FROM (VALUES (${rows.join("), (")})) AS studies, connections
  WHERE connections.source = ${quoteSql(source)} AND connections.source_node_id = ${quoteSql(sourceNodeId)} AND connections.target_node_id = ${quoteSql(targetNodeId)} AND connections.relation = ${quoteSql(relation)};`;
}
