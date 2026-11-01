import type { PlanePoint } from "./layoutLanguages";

export type SpacePoint = { x: number; y: number; z: number };

/** One sample of a surface: where it is, and the unit vector pointing outward from it. */
export type SurfaceSample = { position: SpacePoint; normal: SpacePoint };

/**
 * Padding is the radius of the ball swept around the hull. Flattening scales the surface's height.
 * Corner sharpness sets how closely the surface follows the hull's corners: higher values give flatter sides,
 * lower values a rounder body that bulges between the points.
 */
export type HullSurfaceShape = { padding: number; flattening: number; cornerSharpness: number };

/**
 * Samples a smooth closed surface around a set of points lying in the plane: a rounded version of the points' convex hull,
 * swept with a ball of the padding's radius, then squashed along the vertical axis by the flattening factor.
 * Returns rings of samples from the bottom pole to the top pole, each ring going around once.
 */
export function paddedHullSurface(
  points: PlanePoint[],
  shape: HullSurfaceShape,
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
      return sampleInDirection(points, shape, direction);
    });
  });
}

/**
 * The swept hull's surface point in a direction is the hull's point reaching furthest that way, pushed out by the padding,
 * and the surface's normal there is the direction itself. Squashing the surface vertically stretches the normal the other way.
 */
function sampleInDirection(
  points: PlanePoint[],
  { padding, flattening, cornerSharpness }: HullSurfaceShape,
  direction: SpacePoint,
) {
  const extreme = findSoftExtremePoint(points, direction, cornerSharpness);
  const normalLength = Math.hypot(direction.x, direction.y, direction.z / flattening);
  return {
    position: {
      x: extreme.x + direction.x * padding,
      y: extreme.y + direction.y * padding,
      z: direction.z * padding * flattening,
    },
    normal: {
      x: direction.x / normalLength,
      y: direction.y / normalLength,
      z: direction.z / flattening / normalLength,
    },
  } satisfies SurfaceSample;
}

/**
 * Finds a weighted average of the points, favoring those reaching furthest in the given direction,
 * which depends only on the direction's horizontal part. Taking the furthest point alone would give the exact convex hull,
 * with flat sides and sharp corners; the weighted average rounds it off.
 */
function findSoftExtremePoint(
  points: PlanePoint[],
  direction: SpacePoint,
  cornerSharpness: number,
) {
  const reaches = points.map((point) => point.x * direction.x + point.y * direction.y);
  const furthest = Math.max(...reaches);
  const weights = reaches.map((reach) => Math.exp(cornerSharpness * (reach - furthest)));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const average = { x: 0, y: 0 };
  points.forEach((point, index) => {
    const weight = (weights[index] ?? 0) / totalWeight;
    average.x += point.x * weight;
    average.y += point.y * weight;
  });
  return average;
}
