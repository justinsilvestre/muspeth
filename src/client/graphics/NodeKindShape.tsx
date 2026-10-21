import type { NodeKind } from "../../shared/graph";
import type { Point } from "./Point";

const size = 7;

/** Draws an SVG mark whose shape stands for a kind of node, centred on a point. */
export function NodeKindShape({ kind, at }: { kind: NodeKind | undefined; at: Point }) {
  return (
    <g transform={`translate(${at.x} ${at.y})`} className="fill-page stroke-[1.75] stroke-ink">
      {drawShape(kind)}
    </g>
  );
}

function drawShape(kind: NodeKind | undefined) {
  switch (kind) {
    case "compound":
      return <polygon points={listPolygonPoints(6, size + 1, 0)} />;
    case "cultural_object":
      return <rect x={-size + 1} y={-size + 1} width={2 * size - 2} height={2 * size - 2} />;
    case "word":
      return <path d="M -8 -6 h 16 v 10 h -9 l -4 4 v -4 h -3 z" />;
    case "story_motif":
      return <polygon points={listPolygonPoints(4, size + 2, Math.PI / 2)} />;
    case "recording":
      return <polygon points={listPolygonPoints(3, size + 1, 0)} />;
    case "place":
      return <polygon points={listPolygonPoints(3, size + 1, Math.PI / 2)} />;
    default:
      return <circle r={size} />;
  }
}

/** Lists the corners of a regular polygon about the origin, starting at the given angle. */
function listPolygonPoints(cornerCount: number, radius: number, startAngle: number) {
  return Array.from({ length: cornerCount }, (_, index) => {
    const angle = startAngle + (2 * Math.PI * index) / cornerCount;
    return `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}
