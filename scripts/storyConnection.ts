import { ranks } from "./gbifTaxonomy.ts";
import type { ConnectionDraft } from "./graphDrafts.ts";

/** Records a link through words or stories, which are meanings that people assign. */
export function toStoryConnection(fields: Omit<ConnectionDraft, "kind" | "basis">) {
  return {
    ...fields,
    kind: "shared_words_and_stories",
    basis: "attributed",
  } satisfies ConnectionDraft;
}

/**
 * Keeps one connection for each pair of nodes and relation.
 * Of connections found through several taxa, such as "bee" and "insect",
 * it keeps the one at the finest taxonomic level.
 */
export function keepFinestConnections(connections: ConnectionDraft[]) {
  const kept = new Map<string, ConnectionDraft>();
  for (const connection of connections) {
    const key = `${connection.sourceNodeId}\n${connection.relation}\n${connection.targetNodeId}`;
    const existing = kept.get(key);
    if (!existing || toFineness(connection) > toFineness(existing)) kept.set(key, connection);
  }
  return [...kept.values()];
}

function toFineness({ taxonomicLevel }: ConnectionDraft) {
  return ranks.indexOf(taxonomicLevel as (typeof ranks)[number]);
}
