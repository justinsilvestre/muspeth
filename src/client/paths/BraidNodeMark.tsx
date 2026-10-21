import clsx from "clsx";
import { useId } from "react";
import { NodeKindShape } from "../graphics/NodeKindShape";
import type { Point } from "../graphics/Point";
import { truncateLabel } from "../graphics/truncateLabel";
import { describeMediaCredit } from "../media/MediaCredit";
import { resizeCommonsImage } from "../media/resizeCommonsImage";
import { termLabel } from "../termLabel";
import { countNeighbors, type DescribePathNode } from "./createPathNodeDescriber";

type BraidNodeMarkProps = {
  node: ReturnType<DescribePathNode>;
  at: Point;
  /** Whether the node is one of the two the reader chose, which are drawn with a heavier outline. */
  isEnd: boolean;
  selection: { isLit: boolean; isSelected: boolean; onSelect: () => void };
};

/**
 * Draws a node of the path drawing as its image, or else the shape of its kind, with its name above.
 * Nodes with more neighbours are drawn larger.
 */
export function BraidNodeMark({ node, at, isEnd, selection }: BraidNodeMarkProps) {
  const clipId = useId();
  const radius = Math.max(sizeByNeighbors(node.neighborCount), isEnd ? 12 : 0);
  const image = node.kind !== "recording" ? node.media : undefined;
  const description = `${node.name}, ${termLabel(node.kind ?? "node")}, ${countNeighbors(node.neighborCount)}`;
  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG has no button element, so a group takes the role.
    <g
      role="button"
      tabIndex={0}
      aria-label={description}
      aria-pressed={selection.isSelected}
      onClick={selection.onSelect}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        selection.onSelect();
      }}
      className={clsx("group cursor-pointer outline-none", !selection.isLit && "opacity-30")}
    >
      <title>{image ? `${description} (image: ${describeMediaCredit(image)})` : description}</title>
      <circle
        cx={at.x}
        cy={at.y}
        r={radius + 4}
        className="fill-none stroke-none group-focus-visible:stroke-2 group-focus-visible:stroke-ink"
      />
      {image ? (
        <>
          <clipPath id={clipId}>
            <circle cx={at.x} cy={at.y} r={radius} />
          </clipPath>
          <circle cx={at.x} cy={at.y} r={radius} className="fill-subtle" />
          <image
            href={resizeCommonsImage(image.url, 120)}
            x={at.x - radius}
            y={at.y - radius}
            width={2 * radius}
            height={2 * radius}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <circle cx={at.x} cy={at.y} r={radius} className="fill-none stroke-[1.75] stroke-ink" />
        </>
      ) : (
        <NodeKindShape kind={node.kind} at={at} radius={radius} />
      )}
      {isEnd && (
        <circle cx={at.x} cy={at.y} r={radius + 2} className="fill-none stroke-[1.5] stroke-ink" />
      )}
      <text
        x={at.x}
        y={at.y - radius - 7}
        textAnchor="middle"
        className={clsx("fill-ink", (isEnd || selection.isSelected) && "font-medium")}
      >
        {truncateLabel(node.name, 20)}
      </text>
    </g>
  );
}

/** Sizes a node mark by its number of neighbours, on a logarithmic scale, so that hubs stand out without dwarfing the rest. */
function sizeByNeighbors(neighborCount: number) {
  return Math.min(20, Math.max(7, 4 + 2.6 * Math.log(1 + neighborCount)));
}
