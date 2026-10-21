import clsx from "clsx";
import { useId } from "react";
import type { RankedPath } from "../../shared/findPaths";
import { KindPath } from "../graphics/KindPath";
import type { Point } from "../graphics/Point";
import { BraidNodeMark } from "./BraidNodeMark";
import type { DescribePathNode } from "./createPathNodeDescriber";
import { describeChainLink } from "./describeChainLink";
import { layoutPathBraid } from "./layoutPathBraid";
import { listSelectedPathIndexes, type PathSelection } from "./pathSelection";

const width = 720;
const marginX = 80;
const marginTop = 44;
const laneGap = 64;
const marginBottom = 28;

type PathBraidProps = {
  paths: RankedPath[];
  describeNode: DescribePathNode;
  selection: PathSelection;
  onSelect: (selection: PathSelection) => void;
};

/**
 * Draws every path found as one drawing, in which a node or link that several paths share appears once.
 * The selected path, or the paths through the selected node, stand out from the rest.
 */
export function PathBraid({ paths, describeNode, selection, onSelect }: PathBraidProps) {
  const id = useId();
  const { nodes, links, laneCount } = layoutPathBraid(paths);
  const height = marginTop + (laneCount - 1) * laneGap + marginBottom;
  const selected = listSelectedPathIndexes(selection, paths);
  const isLit = (pathIndexes: number[]) => pathIndexes.some((index) => selected.has(index));
  const pathsThrough = (nodeId: string) =>
    paths.flatMap(({ nodeIds }, index) => (nodeIds.includes(nodeId) ? [index] : []));
  const placeOf = (nodeId: string) => toPoint(nodes.find((node) => node.nodeId === nodeId));

  return (
    <div className="overflow-x-auto">
      <svg
        aria-labelledby={`${id}-title`}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[560px] text-[12px]"
      >
        <title id={`${id}-title`}>The paths drawn together</title>
        {links.map(({ nodeIds, pathIndexes }) => {
          const step = findStep(paths[pathIndexes[0] ?? 0], nodeIds);
          const link = step && describeChainLink(step);
          if (!link) return null;
          const d = curveBetween(placeOf(nodeIds[0]), placeOf(nodeIds[1]));
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
        {nodes.map(({ nodeId, x }) => (
          <BraidNodeMark
            key={nodeId}
            node={describeNode(nodeId)}
            at={placeOf(nodeId)}
            isEnd={x === 0 || x === 1}
            selection={{
              isLit: isLit(pathsThrough(nodeId)),
              isSelected: "nodeId" in selection && selection.nodeId === nodeId,
              onSelect: () => onSelect({ nodeId }),
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function toPoint(node: { x: number; lane: number } | undefined) {
  return {
    x: marginX + (node?.x ?? 0) * (width - 2 * marginX),
    y: marginTop + (node?.lane ?? 0) * laneGap,
  } satisfies Point;
}

/** Draws a link as a curve that leaves and enters its nodes horizontally. */
function curveBetween(from: Point, to: Point) {
  const middleX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${middleX} ${from.y}, ${middleX} ${to.y}, ${to.x} ${to.y}`;
}

function findStep(path: RankedPath | undefined, [oneId, otherId]: [string, string]) {
  return path?.steps.find(
    ({ fromNodeId, toNodeId }) =>
      (fromNodeId === oneId && toNodeId === otherId) ||
      (fromNodeId === otherId && toNodeId === oneId),
  );
}

/** Picks the path that a click on a link selects: the selected path, if it passes along the link, or else the best one that does. */
function pickPath(pathIndexes: number[], selection: PathSelection) {
  const isSelectedHere = "pathIndex" in selection && pathIndexes.includes(selection.pathIndex);
  return isSelectedHere ? selection.pathIndex : Math.min(...pathIndexes);
}
