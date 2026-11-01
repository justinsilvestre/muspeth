import type { PlanePoint } from "./layoutLanguages";

/**
 * Traces a smooth closed outline around a set of points: the convex hull of the points, pushed outward by the padding
 * so that its corners are rounded. Returns the outline as evenly spaced samples going counterclockwise.
 */
export function membraneContour(points: PlanePoint[], padding: number, sampleCount: number) {
  return Array.from({ length: sampleCount }, (_, index) => {
    const angle = (index / sampleCount) * 2 * Math.PI;
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const extreme = findExtremePoint(points, direction);
    return { x: extreme.x + direction.x * padding, y: extreme.y + direction.y * padding };
  });
}

/** Finds the point reaching furthest in the given direction. */
function findExtremePoint(points: PlanePoint[], direction: PlanePoint) {
  let best = points[0] ?? { x: 0, y: 0 };
  let bestReach = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    const reach = point.x * direction.x + point.y * direction.y;
    if (reach > bestReach) {
      best = point;
      bestReach = reach;
    }
  }
  return best;
}
