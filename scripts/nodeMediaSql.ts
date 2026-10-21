import type { NodeMedia } from "./graphDrafts.ts";
import { quoteSql } from "./quoteSql.ts";

/** Media to link to a node that is already in the database. */
export type NodeMediaLink = { nodeId: string; media: NodeMedia };

/** The columns that describe a node's media, in the order that `toMediaValues` lists them. */
export const mediaColumns =
  "media_url, media_licence, media_credit, media_page_url, media_source" as const;

/** Lists a node's media values, quoted for SQL, in the order of `mediaColumns`. */
export function toMediaValues(source: string, { url, licence, credit, pageUrl }: NodeMedia) {
  return [url, licence, credit ?? null, pageUrl ?? null, source].map(quoteSql);
}

/** Removes the media that an import's earlier run linked, from whichever nodes it linked them to. */
export function toClearMediaSql(source: string) {
  return `UPDATE nodes SET media_url = NULL, media_licence = NULL, media_credit = NULL, media_page_url = NULL, media_source = NULL
  WHERE media_source = ${quoteSql(source)};`;
}

/**
 * Writes SQL that links media to existing nodes under `source`, in place of what an earlier run of
 * the same import linked. A node that already has media from another import keeps it.
 */
export function toNodeMediaSql(source: string, links: NodeMediaLink[]) {
  return [toClearMediaSql(source), ...links.map((link) => toLinkSql(source, link))].join("\n");
}

function toLinkSql(source: string, { nodeId, media }: NodeMediaLink) {
  const [url, licence, credit, pageUrl, mediaSource] = toMediaValues(source, media);
  return `UPDATE nodes SET media_url = ${url}, media_licence = ${licence}, media_credit = ${credit}, media_page_url = ${pageUrl}, media_source = ${mediaSource}
  WHERE id = ${quoteSql(nodeId)} AND media_url IS NULL;`;
}
