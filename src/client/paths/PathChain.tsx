import { useId } from "react";
import type { RankedPath } from "../../shared/findPaths";
import type { NodeKind } from "../../shared/graph";
import { KindLine } from "../graphics/KindLine";
import { NodeKindShape } from "../graphics/NodeKindShape";
import type { Point } from "../graphics/Point";
import { truncateLabel } from "../graphics/truncateLabel";
import { termLabel } from "../termLabel";
import { describeChainLink } from "./describeChainLink";
import { layoutPathChain } from "./layoutPathChain";

type PathChainProps = {
  path: RankedPath;
  rank: number;
  nameOf: (nodeId: string) => string;
  kindOf: (nodeId: string) => NodeKind | undefined;
};

/** Draws a path as a chain of nodes joined by coloured links: a row on wide screens, a column on narrow ones. */
export function PathChain(props: PathChainProps) {
  return (
    <>
      <div className="hidden sm:block">
        <ChainDrawing {...props} orientation="row" />
      </div>
      <div className="sm:hidden">
        <ChainDrawing {...props} orientation="column" />
      </div>
    </>
  );
}

function ChainDrawing({
  path,
  rank,
  nameOf,
  kindOf,
  orientation,
}: PathChainProps & { orientation: "row" | "column" }) {
  const id = useId();
  const { points, width, height } = layoutPathChain(path.nodeIds.length, orientation);
  const isRow = orientation === "row";
  return (
    <svg
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      className="h-auto max-w-full text-[12px]"
    >
      <title id={`${id}-title`}>Path {rank} drawn as a chain</title>
      <desc id={`${id}-desc`}>{describeChain(path, nameOf)}</desc>
      {path.steps.map((step, index) => {
        const link = describeChainLink(step);
        const [from, to] = [points[index], points[index + 1]];
        if (!link || !from || !to) return null;
        return (
          <g key={step.toNodeId}>
            <KindLine {...shortenLink(from, to, 13)} kind={link.kind} dashed={link.dashed} />
            <text
              {...placeRelationLabel(from, to, isRow)}
              textAnchor={isRow ? "middle" : "start"}
              dominantBaseline="middle"
              className="fill-muted text-[11px]"
            >
              {truncateLabel(link.label, isRow ? 24 : 44)}
            </text>
          </g>
        );
      })}
      {path.nodeIds.map((nodeId, index) => {
        const at = points[index] ?? { x: 0, y: 0 };
        return (
          <g key={nodeId}>
            <NodeKindShape kind={kindOf(nodeId)} at={at} />
            <text
              {...(isRow ? { x: at.x, y: at.y + 24 } : { x: at.x + 18, y: at.y })}
              textAnchor={isRow ? "middle" : "start"}
              dominantBaseline="middle"
              className="fill-ink font-medium"
            >
              {truncateLabel(nameOf(nodeId), isRow ? 22 : 40)}
              <title>{`${nameOf(nodeId)} (${termLabel(kindOf(nodeId) ?? "node")})`}</title>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Moves both ends of a link towards each other, so that it stops short of the node marks. */
function shortenLink(from: Point, to: Point, by: number) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const [dx, dy] = [((to.x - from.x) / length) * by, ((to.y - from.y) / length) * by];
  return { from: { x: from.x + dx, y: from.y + dy }, to: { x: to.x - dx, y: to.y - dy } };
}

function placeRelationLabel(from: Point, to: Point, isRow: boolean) {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  return isRow ? { x: middle.x, y: middle.y - 12 } : { x: middle.x + 18, y: middle.y };
}

function describeChain({ nodeIds, kinds }: RankedPath, nameOf: (nodeId: string) => string) {
  const [first = "", ...rest] = nodeIds.map(nameOf);
  const last = rest.pop() ?? "";
  const through = rest.length > 0 ? ` through ${rest.join(", ")}` : "";
  return `From ${first} to ${last}${through}, by ${kinds.map(termLabel).join(", ")} connections.`;
}
