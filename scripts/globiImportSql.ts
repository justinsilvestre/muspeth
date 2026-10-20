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
 */
export function toGlobiImportSql(nodes: OrganismNode[], connections: ConnectionDraft[]) {
  const uniqueNodes = [...new Map(nodes.map((node) => [node.id, node])).values()];
  return [
    `DELETE FROM connections WHERE source = ${quoteSql(source)};`,
    ...uniqueNodes.map(toNodeSql),
    ...uniqueNodes.flatMap(({ id, names }) => names.map((name) => toNodeNameSql(id, name))),
    ...connections.map(toConnectionSql),
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
    connection.citations.join("\n") || null,
    licence,
    JSON.stringify(connection.qualityFlags),
  ];
  return `INSERT INTO connections (source_node_id, target_node_id, kind, relation, basis, taxonomic_level, source, citation, licence, quality_flags)
  VALUES (${values.map(quoteSql).join(", ")});`;
}
