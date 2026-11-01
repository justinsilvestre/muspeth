import type { PlanePoint } from "./layoutLanguages";

export type SpacePoint = { x: number; y: number; z: number };

/**
 * Samples a smooth closed surface around a set of points lying in the plane: the convex hull of the points,
 * swept with a ball of the padding's radius, then squashed along the vertical axis by the flattening factor.
 * Returns rings of samples from the bottom pole to the top pole, each ring going around once.
 */
export function paddedHullSurface(
  points: PlanePoint[],
  padding: number,
  flattening: number,
  { rings, segments }: { rings: number; segments: number },
) {
  return Array.from({ length: rings + 1 }, (_, ringIndex) => {
    const latitude = (ringIndex / rings - 0.5) * Math.PI;
    return Array.from({ length: segments + 1 }, (_, segmentIndex) => {
      const longitude = (segmentIndex / segments) * 2 * Math.PI;
      const direction = {
        x: Math.cos(latitude) * Math.cos(longitude),
        y: Math.cos(latitude) * Math.sin(longitude),
        z: Math.sin(latitude),
      };
      const extreme = findExtremePoint(points, direction);
      return {
        x: extreme.x + direction.x * padding,
        y: extreme.y + direction.y * padding,
        z: direction.z * padding * flattening,
      } satisfies SpacePoint;
    });
  });
}

/** Finds the point reaching furthest in the given direction, which depends only on the direction's horizontal part. */
function findExtremePoint(points: PlanePoint[], direction: SpacePoint) {
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
