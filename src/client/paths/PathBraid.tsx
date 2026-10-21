import clsx from "clsx";
import { useId } from "react";
import type { RankedPath } from "../../shared/findPaths";
import { KindPath } from "../graphics/KindPath";
import { useMatchesMedia } from "../useMatchesMedia";
import { BraidNodeMark } from "./BraidNodeMark";
import { createBraidGeometry } from "./createBraidGeometry";
import type { DescribePathNode } from "./createPathNodeDescriber";
import { describeChainLink } from "./describeChainLink";
import type { PathGroup } from "./groupPathVariants";
import { layoutPathBraid } from "./layoutPathBraid";
import { listSelectedPathIndexes, type PathSelection } from "./pathSelection";

/** Matches screens narrower than Tailwind's `sm` breakpoint. */
const narrowQuery = "(max-width: 639px)";

type PathBraidProps = {
  groups: PathGroup[];
  describeNode: DescribePathNode;
  selection: PathSelection;
  onSelect: (selection: PathSelection) => void;
};

/**
 * Draws every path found as one drawing, in which a node or link that several paths share appears once.
 * Paths that differ only by one node are drawn as one, with that node's mark stacked.
 * The selected path, or the paths through the selected node, stand out from the rest.
 * The drawing runs from left to right on wide screens and from top to bottom on narrow ones.
 */
export function PathBraid({ groups, describeNode, selection, onSelect }: PathBraidProps) {
  const id = useId();
  const best = groups.map(({ paths }) => paths[0]).filter((path) => path !== undefined);
  const { nodes, links, laneCount } = layoutPathBraid(best);
  const stepCount = Math.max(...best.map(({ steps }) => steps.length));
  const orientation = useMatchesMedia(narrowQuery) ? "column" : "row";
  const geometry = createBraidGeometry(orientation, laneCount, stepCount);
  const groupRoutes = groups.map(({ paths }) => ({
    nodeIds: paths.flatMap((path) => path.nodeIds),
  }));
  const selected = listSelectedPathIndexes(selection, groupRoutes);
  const isLit = (indexes: number[]) => indexes.some((index) => selected.has(index));
  const placeOf = (nodeId: string) =>
    geometry.toPoint(nodes.find((node) => node.nodeId === nodeId) ?? { x: 0, lane: 0 });

  return (
    <svg
      aria-labelledby={`${id}-title`}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={clsx("h-auto w-full text-[12px]", orientation === "column" && "max-w-[340px]")}
    >
      <title id={`${id}-title`}>The paths drawn together</title>
      {links.map(({ nodeIds, pathIndexes }) => {
        const step = findStep(best[pathIndexes[0] ?? 0], nodeIds);
        const link = step && describeChainLink(step);
        if (!link) return null;
        const d = geometry.curveBetween(placeOf(nodeIds[0]), placeOf(nodeIds[1]));
        const choose = () => onSelect({ pathIndex: pickPath(pathIndexes, selection) });
        return (
          <g key={nodeIds.join(" ")} className={clsx(!isLit(pathIndexes) && "opacity-20")}>
            <KindPath d={d} kind={link.kind} dashed={link.dashed} className="stroke-3" />
            {/* biome-ignore lint/a11y/noStaticElementInteractions: A wide invisible line makes the link easy to click; the path buttons serve keyboards. */}
            <path
              d={d}
              onClick={choose}
              className="cursor-pointer fill-none stroke-[14] stroke-transparent"
            >
              <title>{link.label}</title>
            </path>
          </g>
        );
      })}
      {nodes.map(({ nodeId, x }) => {
        const variantGroup = findVariantGroup(groups, nodeId);
        const throughIndexes = groupRoutes.flatMap((route, index) =>
          route.nodeIds.includes(nodeId) ? [index] : [],
        );
        return (
          <BraidNodeMark
            key={nodeId}
            node={{
              ...describeNode(nodeId),
              variantNames: listOtherVariants(variantGroup, nodeId, describeNode),
            }}
            at={placeOf(nodeId)}
            look={{
              isEnd: x === 0 || x === 1,
              labelLength: x === 0 || x === 1 ? geometry.endLabelLength : geometry.labelLength,
              labelSide: orientation === "column" && x === 1 ? "below" : "above",
            }}
            selection={{
              isLit: isLit(throughIndexes),
              isSelected: "nodeId" in selection && selection.nodeId === nodeId,
              onSelect: () =>
                onSelect(variantGroup ? { pathIndex: groups.indexOf(variantGroup) } : { nodeId }),
            }}
          />
        );
      })}
    </svg>
  );
}

function findStep(path: RankedPath | undefined, [oneId, otherId]: [string, string]) {
  return path?.steps.find(
    ({ fromNodeId, toNodeId }) =>
      (fromNodeId === oneId && toNodeId === otherId) ||
      (fromNodeId === otherId && toNodeId === oneId),
  );
}

/** Finds the group of variant paths whose best path passes through the node where the variants differ. */
function findVariantGroup(groups: PathGroup[], nodeId: string) {
  return groups.find(
    ({ paths, variantPosition }) =>
      paths.length > 1 &&
      variantPosition !== undefined &&
      paths[0]?.nodeIds[variantPosition] === nodeId,
  );
}

function listOtherVariants(
  group: PathGroup | undefined,
  nodeId: string,
  describeNode: DescribePathNode,
) {
  if (group?.variantPosition === undefined) return [];
  const position = group.variantPosition;
  return group.paths
    .map(({ nodeIds }) => nodeIds[position] ?? "")
    .filter((variantId) => variantId !== nodeId)
    .map((variantId) => describeNode(variantId).name);
}

/** Picks the path that a click on a link selects: the selected path, if it passes along the link, or else the best one that does. */
function pickPath(pathIndexes: number[], selection: PathSelection) {
  const isSelectedHere = "pathIndex" in selection && pathIndexes.includes(selection.pathIndex);
  return isSelectedHere ? selection.pathIndex : Math.min(...pathIndexes);
}
