/** The distance between neighbouring nodes, and from the outer nodes to the drawing's edges. */
const spacingByOrientation = {
  row: { gap: 150, margin: 70, across: 38, breadth: 66 },
  column: { gap: 48, margin: 14, across: 12, breadth: 320 },
};

/**
 * Places a path's nodes evenly along a row or down a column.
 * Returns each node's centre and the size of the drawing.
 */
export function layoutPathChain(nodeCount: number, orientation: "row" | "column") {
  const { gap, margin, across, breadth } = spacingByOrientation[orientation];
  const offsets = Array.from({ length: nodeCount }, (_, index) => margin + index * gap);
  const length = 2 * margin + (nodeCount - 1) * gap;
  if (orientation === "row") {
    return { points: offsets.map((x) => ({ x, y: across })), width: length, height: breadth };
  }
  return { points: offsets.map((y) => ({ x: across, y })), width: breadth, height: length };
}
