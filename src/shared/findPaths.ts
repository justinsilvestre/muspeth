import type { ConnectionKind } from "./graph";
import type { GraphEdge } from "./graphExport";
import { MinHeap } from "./minHeap";
import { measureStepsFrom, type PathGraph } from "./pathGraph";

/** One step of a path, with every connection between its two nodes. */
export type PathStep = {
  fromNodeId: string;
  toNodeId: string;
  connections: GraphEdge[];
};

/** A path between two nodes; the lower its cost, the better it ranks. */
export type RankedPath = {
  nodeIds: string[];
  steps: PathStep[];
  /** The kinds of connection the path crosses, in the order it first crosses them. */
  kinds: ConnectionKind[];
  /** How many distinct neighbours each node of the path has, in the order of `nodeIds`. */
  neighborCounts: number[];
  cost: number;
};

export type PathSearchOptions = {
  limit: number;
  maxSteps: number;
  /** How many partial paths to extend before giving up, which bounds the time a search takes. */
  maxExpansions: number;
};

export const defaultPathSearchOptions = {
  limit: 5,
  maxSteps: 4,
  maxExpansions: 20_000,
} satisfies PathSearchOptions;

/**
 * How much a step costs when it crosses a kind of connection that the path has not crossed yet.
 * It is also the least that any step can cost.
 */
const newKindCostFactor = 0.5;

type PartialPath = RankedPath & { estimate: number; order: number };

/**
 * Finds the best simple paths between two nodes, best first.
 * Each step costs 1 plus the natural logarithm of the degree of the node it enters, so that paths through hubs rank lower.
 * The step that enters the end node costs 1.
 * A step that crosses a new kind of connection costs half, so that paths crossing several kinds rank higher.
 */
export function findPaths(
  graph: PathGraph,
  fromId: string,
  toId: string,
  options: Partial<PathSearchOptions> = {},
) {
  const { limit, maxSteps, maxExpansions } = { ...defaultPathSearchOptions, ...options };
  const stepsToEnd = measureStepsFrom(graph, toId, maxSteps);
  if (fromId === toId || !stepsToEnd.has(fromId)) return [];

  // An A* search over partial paths, estimating what remains by the least that each step can cost.
  // Since the estimate never overstates the remaining cost, complete paths come out cheapest first.
  let order = 0;
  const frontier = new MinHeap<PartialPath>((a, b) => a.estimate - b.estimate || a.order - b.order);
  frontier.push({
    nodeIds: [fromId],
    steps: [],
    kinds: [],
    neighborCounts: [graph.degreeOf(fromId)],
    cost: 0,
    estimate: 0,
    order,
  });
  const paths: RankedPath[] = [];
  for (let expansions = 0; paths.length < limit && expansions < maxExpansions; ) {
    const path = frontier.pop();
    if (!path) break;
    const nodeId = path.nodeIds.at(-1) ?? fromId;
    if (nodeId === toId) {
      paths.push(toRankedPath(path));
      continue;
    }
    expansions++;
    for (const [neighborId, connections] of graph.edgesByNeighborId.get(nodeId) ?? []) {
      const remainingSteps = stepsToEnd.get(neighborId);
      if (remainingSteps === undefined || path.nodeIds.includes(neighborId)) continue;
      if (path.steps.length + 1 + remainingSteps > maxSteps) continue;
      const step = { fromNodeId: nodeId, toNodeId: neighborId, connections };
      const next = extendPath(path, step, graph, stepCost(graph, toId, path, step));
      frontier.push({
        ...next,
        estimate: next.cost + remainingSteps * newKindCostFactor,
        order: ++order,
      });
    }
  }
  return paths;
}

function stepCost(graph: PathGraph, toId: string, path: RankedPath, step: PathStep) {
  const degree = Math.max(graph.degreeOf(step.toNodeId), 1);
  const entryCost = step.toNodeId === toId ? 1 : 1 + Math.log(degree);
  const crossesNewKind =
    path.steps.length > 0 && step.connections.some(({ kind }) => !path.kinds.includes(kind));
  return crossesNewKind ? entryCost * newKindCostFactor : entryCost;
}

function extendPath(path: RankedPath, step: PathStep, graph: PathGraph, cost: number) {
  return {
    nodeIds: [...path.nodeIds, step.toNodeId],
    steps: [...path.steps, step],
    kinds: [...new Set([...path.kinds, ...step.connections.map(({ kind }) => kind)])],
    neighborCounts: [...path.neighborCounts, graph.degreeOf(step.toNodeId)],
    cost: path.cost + cost,
  } satisfies RankedPath;
}

function toRankedPath({ nodeIds, steps, kinds, neighborCounts, cost }: PartialPath) {
  return { nodeIds, steps, kinds, neighborCounts, cost } satisfies RankedPath;
}
