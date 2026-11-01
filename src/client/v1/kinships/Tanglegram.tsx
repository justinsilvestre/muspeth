import clsx from "clsx";
import { Link, useSearchParams } from "react-router";
import { clusterAverageLinkage, listLeaves } from "../../../shared/kinships/clusterAverageLinkage";
import type { KinshipGrouping, Kinships } from "../../../shared/kinships/kinships";
import { listNearestKin } from "../../../shared/kinships/listNearestKin";
import { rotateToMatch } from "../../../shared/kinships/rotateToMatch";
import { truncateLabel } from "../graphics/truncateLabel";
import { useElementWidth } from "../useElementWidth";
import { GroupingName } from "./GroupingName";
import { layoutDendrogram } from "./layoutDendrogram";

const rowHeight = 20;
const minWidth = 600;
/** Roughly how wide one character of a label is, in pixels, to know how much of a name fits. */
const characterWidth = 6.5;

type TanglegramProps = {
  kinships: Kinships;
  comparison: KinshipGrouping;
  selectedId: string;
  nameOf: (nodeId: string) => string;
};

/**
 * Draws the descent tree facing the tree of another grouping, with a line joining each organism's two places.
 * The more the lines cross, the more the groupings disagree.
 */
export function Tanglegram({ kinships, comparison, selectedId, nameOf }: TanglegramProps) {
  const [ref, measuredWidth] = useElementWidth<HTMLDivElement>(minWidth);
  const [searchParams] = useSearchParams();
  const width = Math.max(minWidth, measuredWidth);
  const ids = kinships.organisms.map(({ id }) => id);
  const leftTree = clusterAverageLinkage(ids, kinships.distances.descent);
  const rightTree = rotateToMatch(
    clusterAverageLinkage(ids, kinships.distances[comparison]),
    listLeaves(leftTree),
  );
  const treeWidth = Math.round(width * 0.17);
  const linkWidth = Math.round(width * 0.14);
  const labelWidth = (width - 2 * treeWidth - linkWidth) / 2;
  const left = layoutDendrogram(leftTree, { rowHeight, width: treeWidth, side: "left" });
  const right = layoutDendrogram(rightTree, { rowHeight, width: treeWidth, side: "right" });
  const kinIds = new Set(
    listNearestKin(ids, kinships.distances[comparison], selectedId, 3).map(({ id }) => id),
  );
  const height = ids.length * rowHeight;
  const linkFrom = treeWidth + labelWidth;
  const linkTo = linkFrom + linkWidth;
  const labelOf = (id: string) =>
    truncateLabel(nameOf(id), Math.floor(labelWidth / characterWidth));
  const hrefOf = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("organism", id);
    return `?${next}`;
  };

  return (
    <figure className="space-y-2">
      <div ref={ref} className="overflow-x-auto">
        <svg
          width={width}
          height={height + 24}
          viewBox={`0 -24 ${width} ${height + 24}`}
          aria-labelledby="tanglegram-caption"
          className="text-xs"
        >
          <title>{`The descent tree facing the ${comparison.replaceAll("_", " ")} tree`}</title>
          <text x={0} y={-8} className="fill-muted">
            descent
          </text>
          <text x={width} y={-8} textAnchor="end" className="fill-muted">
            {comparison.replaceAll("_", " ")}
          </text>
          <Branches segments={left.segments} className="stroke-ink" />
          <g transform={`translate(${width - treeWidth} 0)`}>
            <Branches segments={right.segments} className={strokeClassOf(comparison)} />
          </g>
          {ids.map((id) => {
            const [y1, y2] = [left.leafY.get(id) ?? 0, right.leafY.get(id) ?? 0];
            const isSelected = id === selectedId;
            const isKin = kinIds.has(id);
            return (
              <g key={id}>
                <line
                  x1={linkFrom}
                  y1={y1}
                  x2={linkTo}
                  y2={y2}
                  className={clsx(
                    isSelected ? "stroke-ink" : isKin ? strokeClassOf(comparison) : "stroke-line",
                  )}
                  strokeWidth={isSelected || isKin ? 2 : 1}
                />
                <Link to={hrefOf(id)} aria-label={`Show the closest kin of ${nameOf(id)}`}>
                  <text
                    x={treeWidth + 4}
                    y={y1}
                    dominantBaseline="middle"
                    className={clsx(isSelected ? "fill-ink font-semibold" : "fill-muted")}
                  >
                    {labelOf(id)}
                  </text>
                </Link>
                <text
                  x={width - treeWidth - 4}
                  y={y2}
                  dominantBaseline="middle"
                  textAnchor="end"
                  className={clsx(
                    isSelected ? "fill-ink font-semibold" : isKin ? "fill-ink" : "fill-muted",
                  )}
                >
                  {labelOf(id)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption
        id="tanglegram-caption"
        className="flex flex-wrap gap-x-4 gap-y-1 text-muted text-xs"
      >
        <span>
          Solid branches join organisms that share something; dotted ones join organisms that share
          nothing in that grouping.
        </span>
        <span>
          Bold lines link the chosen organism and its three closest kin in{" "}
          <GroupingName grouping={comparison} />.
        </span>
      </figcaption>
    </figure>
  );
}

type BranchesProps = {
  segments: ReturnType<typeof layoutDendrogram>["segments"];
  className: string;
};

function Branches({ segments, className }: BranchesProps) {
  return (
    <g fill="none">
      {segments.map((segment) => (
        <line
          key={`${segment.x1} ${segment.y1} ${segment.x2} ${segment.y2}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          className={segment.isUnrelated ? "stroke-faint" : className}
          strokeDasharray={segment.isUnrelated ? "2 3" : undefined}
          strokeWidth={1.5}
        />
      ))}
    </g>
  );
}

const strokeByGrouping = {
  descent: "stroke-ink",
  interaction: "stroke-kind-interaction",
  likeness: "stroke-kind-likeness",
  shared_substance: "stroke-kind-shared-substance",
  shared_culture: "stroke-kind-shared-culture",
  shared_words_and_stories: "stroke-kind-shared-words-and-stories",
  shared_place_and_sound: "stroke-kind-shared-place-and-sound",
} satisfies Record<KinshipGrouping, string>;

function strokeClassOf(grouping: KinshipGrouping) {
  return strokeByGrouping[grouping];
}
