import { countNodesByKind } from "./countNodesByKind";
import type { NodeCatalog } from "./createNodeCatalog";
import { searchNodes } from "./searchNodes";

/** Counts the nodes of each kind that match a search, or every node of each kind when nothing is searched. */
export function countMatchesByKind(catalog: NodeCatalog, query: string) {
  if (!query.trim()) return catalog.nodeCountsByKind;
  return countNodesByKind(searchNodes(catalog.searchIndex, query).map(({ node }) => node));
}
