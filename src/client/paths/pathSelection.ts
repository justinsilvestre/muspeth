import type { RankedPath } from "../../shared/findPaths";

/** What the reader has picked among the paths found: one path, by its index, or one node. */
export type PathSelection = { pathIndex: number } | { nodeId: string };

/** Lists the indexes of the paths that a selection picks out: the path itself, or every path through the node. */
export function listSelectedPathIndexes(
  selection: PathSelection,
  routes: Pick<RankedPath, "nodeIds">[],
) {
  if ("pathIndex" in selection) return new Set([selection.pathIndex]);
  const indexes = routes.flatMap(({ nodeIds }, index) =>
    nodeIds.includes(selection.nodeId) ? [index] : [],
  );
  return new Set(indexes);
}
