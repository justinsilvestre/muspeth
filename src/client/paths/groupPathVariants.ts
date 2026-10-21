import type { RankedPath } from "../../shared/findPaths";

/** Paths that differ only by the node at one position, best first. */
export type PathGroup<Path = RankedPath> = { paths: Path[]; variantPosition?: number };

/**
 * Groups paths that pass through the same nodes except at one middle position, keeping the groups in the order of their best paths.
 * For example, paths through three names of the same organism, each leading on to the same node, form one group.
 */
export function groupPathVariants<Path extends Pick<RankedPath, "nodeIds">>(paths: Path[]) {
  const groups: PathGroup<Path>[] = [];
  for (const path of paths) {
    const match = groups.find((group) => findVariantPosition(group, path) !== undefined);
    if (!match) groups.push({ paths: [path] });
    else {
      match.variantPosition = findVariantPosition(match, path);
      match.paths.push(path);
    }
  }
  return groups;
}

/** Finds the one middle position at which a path differs from a group's best path, if it differs only there. */
function findVariantPosition(
  { paths, variantPosition }: PathGroup<Pick<RankedPath, "nodeIds">>,
  path: Pick<RankedPath, "nodeIds">,
) {
  const best = paths[0]?.nodeIds ?? [];
  if (best.length !== path.nodeIds.length) return undefined;
  const differences = best.flatMap((nodeId, index) =>
    nodeId === path.nodeIds[index] ? [] : [index],
  );
  const [position] = differences;
  if (differences.length !== 1 || position === undefined) return undefined;
  return variantPosition === undefined || variantPosition === position ? position : undefined;
}
