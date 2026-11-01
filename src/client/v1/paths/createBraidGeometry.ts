import type { Point } from "../graphics/Point";

const row = { width: 720, marginAlong: 80, marginTop: 44, laneGap: 64, marginBottom: 28 };
const column = { width: 340, marginTop: 44, stepLength: 84, marginBottom: 40, maxLaneGap: 84 };
/** The width of a label's character, roughly, at the drawing's font size. */
const characterWidth = 6.5;

/**
 * Turns the abstract places of a braid's nodes into points of a drawing that runs either from left to right, for wide screens,
 * or from top to bottom, for narrow ones. Also gives the drawing's size, the links' curves and how long the labels of middle nodes and of the ends may be.
 */
export function createBraidGeometry(
  orientation: "row" | "column",
  laneCount: number,
  stepCount: number,
) {
  return orientation === "row"
    ? createRowGeometry(laneCount)
    : createColumnGeometry(laneCount, stepCount);
}

function createRowGeometry(laneCount: number) {
  const { width, marginAlong, marginTop, laneGap, marginBottom } = row;
  return {
    width,
    height: marginTop + (laneCount - 1) * laneGap + marginBottom,
    toPoint: ({ x, lane }: { x: number; lane: number }) =>
      ({
        x: marginAlong + x * (width - 2 * marginAlong),
        y: marginTop + lane * laneGap,
      }) satisfies Point,
    curveBetween: (from: Point, to: Point) => {
      const middleX = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} C ${middleX} ${from.y}, ${middleX} ${to.y}, ${to.x} ${to.y}`;
    },
    labelLength: 20,
    endLabelLength: 20,
  };
}

function createColumnGeometry(laneCount: number, stepCount: number) {
  const { width, marginTop, stepLength, marginBottom, maxLaneGap } = column;
  const laneGap = laneCount > 1 ? Math.min(maxLaneGap, (width - maxLaneGap) / (laneCount - 1)) : 0;
  const length = Math.max(stepCount, 2) * stepLength;
  return {
    width,
    height: marginTop + length + marginBottom,
    toPoint: ({ x, lane }: { x: number; lane: number }) =>
      ({
        x: width / 2 + (lane - (laneCount - 1) / 2) * laneGap,
        y: marginTop + x * length,
      }) satisfies Point,
    curveBetween: (from: Point, to: Point) => {
      const middleY = (from.y + to.y) / 2;
      return `M ${from.x} ${from.y} C ${from.x} ${middleY}, ${to.x} ${middleY}, ${to.x} ${to.y}`;
    },
    labelLength: laneCount > 1 ? Math.max(8, Math.floor(laneGap / characterWidth)) : 40,
    endLabelLength: Math.floor(width / characterWidth),
  };
}
