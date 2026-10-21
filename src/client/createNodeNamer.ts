import type { GraphNode } from "../shared/graph";
import { nodeDisplayName } from "./nodeDisplayName";

/** Returns a function that names a node by its ID in English, falling back to the ID itself. */
export function createNodeNamer(nodes: GraphNode[]) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  return (nodeId: string) => {
    const node = nodesById.get(nodeId);
    return node ? nodeDisplayName(node, "en") : nodeId;
  };
}
