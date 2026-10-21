import type { GraphNode } from "../../shared/graph";
import { nodeDisplayName } from "../nodeDisplayName";

/** Returns the IDs of the nodes whose display name, ignoring case, belongs to another node too. */
export function findNodesWithSharedNames(nodes: GraphNode[]) {
  const nodesByName = Map.groupBy(nodes, (node) => nodeDisplayName(node, "en").toLowerCase());
  const sharedNameNodes = [...nodesByName.values()].filter((group) => group.length > 1);
  return new Set(sharedNameNodes.flat().map(({ id }) => id));
}
