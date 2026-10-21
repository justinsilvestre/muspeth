import type { GraphEdge } from "./graphExport";

/** An undirected adjacency list of the graph, as the path search reads it. */
export type PathGraph = {
  /** Every connection between each pair of neighbouring nodes, keyed by one node, then the other. */
  edgesByNeighborId: ReadonlyMap<string, ReadonlyMap<string, GraphEdge[]>>;
  /** Returns how many distinct neighbours a node has, which measures how much of a hub it is. */
  degreeOf: (nodeId: string) => number;
};

/**
 * Builds the adjacency list that the path search reads, leaving out connections from a node to itself.
 * Pass `degrees` when the edges cover only part of the graph, so that hubs keep their full degree.
 */
export function buildPathGraph(edges: GraphEdge[], degrees?: ReadonlyMap<string, number>) {
  const edgesByNeighborId = new Map<string, Map<string, GraphEdge[]>>();
  for (const edge of edges) {
    if (edge.sourceNodeId === edge.targetNodeId) continue;
    addNeighborEdge(edgesByNeighborId, edge.sourceNodeId, edge.targetNodeId, edge);
    addNeighborEdge(edgesByNeighborId, edge.targetNodeId, edge.sourceNodeId, edge);
  }
  const degreeOf = (nodeId: string) =>
    degrees?.get(nodeId) ?? edgesByNeighborId.get(nodeId)?.size ?? 0;
  return { edgesByNeighborId, degreeOf } satisfies PathGraph;
}

function addNeighborEdge(
  edgesByNeighborId: Map<string, Map<string, GraphEdge[]>>,
  nodeId: string,
  neighborId: string,
  edge: GraphEdge,
) {
  const neighbors = edgesByNeighborId.get(nodeId) ?? new Map<string, GraphEdge[]>();
  neighbors.set(neighborId, [...(neighbors.get(neighborId) ?? []), edge]);
  edgesByNeighborId.set(nodeId, neighbors);
}

/** Returns how many steps away each node within `maxSteps` of the given node is. */
export function measureStepsFrom(graph: PathGraph, nodeId: string, maxSteps: number) {
  const stepsByNodeId = new Map([[nodeId, 0]]);
  let frontier = [nodeId];
  for (let steps = 1; steps <= maxSteps && frontier.length > 0; steps++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighborId of graph.edgesByNeighborId.get(id)?.keys() ?? []) {
        if (stepsByNodeId.has(neighborId)) continue;
        stepsByNodeId.set(neighborId, steps);
        next.push(neighborId);
      }
    }
    frontier = next;
  }
  return stepsByNodeId;
}
