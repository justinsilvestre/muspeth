import type { GraphNode } from "../shared/graph";

/** Returns a function that gives a node's kind by its ID, or undefined for an unknown node. */
export function createNodeKindReader(nodes: GraphNode[]) {
  const kindsById = new Map(nodes.map((node) => [node.id, node.kind]));
  return (nodeId: string) => kindsById.get(nodeId);
}
