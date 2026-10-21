import type { RankedPath } from "../../shared/findPaths";
import type { NodeKind, NodeMedia } from "../../shared/graph";

type NodeLookups = {
  nameOf: (nodeId: string) => string;
  kindOf: (nodeId: string) => NodeKind | undefined;
};

/** Gathers what the path drawing and its details show of each node: its name, kind, image and number of neighbours. */
export function createPathNodeDescriber(
  { nameOf, kindOf }: NodeLookups,
  paths: RankedPath[],
  media: Record<string, NodeMedia>,
) {
  const neighborCounts = new Map(
    paths.flatMap(({ nodeIds, neighborCounts }) =>
      nodeIds.map((nodeId, index) => [nodeId, neighborCounts[index] ?? 0] as const),
    ),
  );
  return (nodeId: string) => ({
    name: nameOf(nodeId),
    kind: kindOf(nodeId),
    media: media[nodeId],
    neighborCount: neighborCounts.get(nodeId) ?? 0,
  });
}

export type DescribePathNode = ReturnType<typeof createPathNodeDescriber>;

/** Counts a node's neighbours in words, for example "1 neighbour" or "28 neighbours". */
export function countNeighbors(neighborCount: number) {
  return `${neighborCount} ${neighborCount === 1 ? "neighbour" : "neighbours"}`;
}
