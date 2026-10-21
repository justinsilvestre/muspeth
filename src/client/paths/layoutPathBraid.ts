import type { RankedPath } from "../../shared/findPaths";

type Route = Pick<RankedPath, "nodeIds">;

/** A node of the braid: how far along it sits, from 0 at the start to 1 at the end, and its lane. */
type BraidNode = { nodeId: string; x: number; lane: number };

/** A link between two neighbouring nodes, with the indexes of the paths that pass along it. */
type BraidLink = { nodeIds: [string, string]; pathIndexes: number[] };

/**
 * Lays out several paths between the same two nodes as one drawing, in which each node and each link appears once.
 * The paths are taken best first.
 * The ends sit at either side on the lane of the best path, so that the best path runs straight.
 * Each later path keeps the nodes it shares with better paths where those paths put them,
 * and its own nodes go on a lane beside the path it shares the most nodes with.
 */
export function layoutPathBraid(routes: Route[]) {
  const lanes = assignLanes(routes);
  const placed = new Map<string, BraidNode>();
  routes.forEach(({ nodeIds }, index) => {
    placeEnds(nodeIds, lanes[0] ?? 0, placed);
    placeMiddleNodes(nodeIds, lanes[index] ?? 0, placed);
  });
  return { nodes: [...placed.values()], links: listLinks(routes), laneCount: routes.length };
}

/** Gives each path a lane, ordering the lanes so that paths sharing nodes sit side by side. */
function assignLanes(routes: Route[]) {
  const order = [0];
  for (let index = 1; index < routes.length; index++) {
    order.splice(findLanePosition(order, findClosestPartner(routes, index)), 0, index);
  }
  return routes.map((_, index) => order.indexOf(index));
}

/**
 * Finds where in the order of lanes a path goes: beside its partner, on the side away from the best path,
 * or, without a partner, on the outside of whichever side of the best path has fewer lanes.
 */
function findLanePosition(order: number[], partner: number | undefined) {
  const center = order.indexOf(0);
  const isAboveFewer = center <= order.length - 1 - center;
  if (partner === undefined) return isAboveFewer ? 0 : order.length;
  const at = order.indexOf(partner);
  const isAbove = partner === 0 ? isAboveFewer : at < center;
  return isAbove ? at : at + 1;
}

/** Finds the better path that shares the most middle nodes with the given one, if any shares one. */
function findClosestPartner(routes: Route[], index: number) {
  const middle = new Set(routes[index]?.nodeIds.slice(1, -1));
  let partner: number | undefined;
  let mostShared = 0;
  routes.slice(0, index).forEach(({ nodeIds }, candidate) => {
    const shared = nodeIds.filter((nodeId) => middle.has(nodeId)).length;
    if (shared > mostShared) [partner, mostShared] = [candidate, shared];
  });
  return partner;
}

function placeEnds(nodeIds: string[], lane: number, placed: Map<string, BraidNode>) {
  const [first, last] = [nodeIds[0], nodeIds.at(-1)];
  if (first && !placed.has(first)) placed.set(first, { nodeId: first, x: 0, lane });
  if (last && !placed.has(last)) placed.set(last, { nodeId: last, x: 1, lane });
}

/** Spaces each run of nodes not yet placed evenly between the placed nodes on either side of it. */
function placeMiddleNodes(nodeIds: string[], lane: number, placed: Map<string, BraidNode>) {
  let anchor = 0;
  nodeIds.forEach((nodeId, index) => {
    const at = placed.get(nodeId);
    if (!at || index === 0) return;
    const fromX = placed.get(nodeIds[anchor] ?? "")?.x ?? 0;
    const gap = index - anchor;
    for (let step = 1; step < gap; step++) {
      const runNodeId = nodeIds[anchor + step] ?? "";
      placed.set(runNodeId, { nodeId: runNodeId, x: fromX + ((at.x - fromX) * step) / gap, lane });
    }
    anchor = index;
  });
}

function listLinks(routes: Route[]) {
  const linksByKey = new Map<string, BraidLink>();
  routes.forEach(({ nodeIds }, pathIndex) => {
    nodeIds.slice(1).forEach((toId, index) => {
      const fromId = nodeIds[index] ?? "";
      const key = [fromId, toId].sort().join(" ");
      const link = linksByKey.get(key) ?? { nodeIds: [fromId, toId], pathIndexes: [] };
      linksByKey.set(key, { ...link, pathIndexes: [...link.pathIndexes, pathIndex] });
    });
  });
  return [...linksByKey.values()];
}
