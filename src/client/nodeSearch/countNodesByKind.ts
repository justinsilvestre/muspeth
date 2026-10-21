import { type GraphNode, type NodeKind, nodeKinds } from "../../shared/graph";

/** Counts the nodes of every kind, including kinds with none. */
export function countNodesByKind(nodes: GraphNode[]) {
  const counts = Object.fromEntries(nodeKinds.map((kind) => [kind, 0])) as Record<NodeKind, number>;
  for (const { kind } of nodes) counts[kind] += 1;
  return counts;
}
