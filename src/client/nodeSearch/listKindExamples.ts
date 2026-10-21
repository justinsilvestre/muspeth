import { type GraphNode, type NodeKind, nodeKinds } from "../../shared/graph";

/**
 * Picks a few nodes of every kind to show as examples.
 * The preferred nodes come first, then the nodes with the most names.
 */
export function listKindExamples(nodes: GraphNode[], preferredNodes: GraphNode[], count: number) {
  const preferredIds = new Set(preferredNodes.map(({ id }) => id));
  const byNameCount = nodes
    .filter(({ id }) => !preferredIds.has(id))
    .toSorted((a, b) => b.names.length - a.names.length);
  const candidates = [...preferredNodes, ...byNameCount];
  return Object.fromEntries(
    nodeKinds.map((kind) => [
      kind,
      candidates.filter((node) => node.kind === kind).slice(0, count),
    ]),
  ) as Record<NodeKind, GraphNode[]>;
}
