import type { NodeKind } from "../../shared/graph";
import type { NodeCatalog } from "./createNodeCatalog";
import { type NodeMatch, searchNodes } from "./searchNodes";

/** The most matches to show at once by default, so that the page stays small. */
export const maxShownMatches = 50;

/**
 * Returns the first matches of a search, with the total number of matches.
 * Without a query or kind, returns the starting points, and no total.
 */
export function findShownMatches(
  catalog: NodeCatalog,
  query: string,
  kind?: NodeKind,
  limit = maxShownMatches,
) {
  if (!query.trim() && !kind) {
    const matches = catalog.startingPoints.map((node) => ({ node }) satisfies NodeMatch);
    return { matches, totalCount: undefined };
  }
  const matches = searchNodes(catalog.searchIndex, query, kind);
  return { matches: matches.slice(0, limit), totalCount: matches.length };
}
