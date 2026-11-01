import type { PlanePoint } from "./layoutLanguages";

/**
 * Padding is the radius of the ball swept around the hull. Flattening scales the surface's height.
 * Corner sharpness sets how closely the surface follows the hull's corners: higher values give flatter sides,
 * lower values a rounder body that bulges between the points.
 */
export type HullSurfaceShape = { padding: number; flattening: number; cornerSharpness: number };

export type SurfaceDetail = { rings: number; segments: number };

/**
 * A closed surface sampled in rings from the bottom pole to the top pole, each ring going around once.
 * Positions and normals hold three numbers per sample, ring by ring, with each ring's first sample repeated at its end.
 */
export type SampledSurface = SurfaceDetail & { positions: Float32Array; normals: Float32Array };

/**
 * Samples a smooth closed surface around a set of points lying in the plane: a rounded version of the points' convex hull,
 * swept with a ball of the padding's radius, then squashed along the vertical axis by the flattening factor.
 * The surface's point in a direction is the hull's point reaching furthest that way, pushed out by the padding,
 * and its normal there is the direction itself, stretched the other way from the squashing.
 */
export function paddedHullSurface(
  points: PlanePoint[],
  { padding, flattening, cornerSharpness }: HullSurfaceShape,
  { rings, segments }: SurfaceDetail,
) {
  const sampleCount = (rings + 1) * (segments + 1);
  const positions = new Float32Array(sampleCount * 3);
  const normals = new Float32Array(sampleCount * 3);
  const average = { x: 0, y: 0 };
  let offset = 0;
  for (let ring = 0; ring <= rings; ring++) {
    const latitude = (ring / rings - 0.5) * Math.PI;
    const horizontal = Math.cos(latitude);
    const vertical = Math.sin(latitude);
    for (let segment = 0; segment <= segments; segment++) {
      const longitude = (segment / segments) * 2 * Math.PI;
      const directionX = horizontal * Math.cos(longitude);
      const directionY = horizontal * Math.sin(longitude);
      averageTowards(points, directionX, directionY, cornerSharpness, average);
      positions[offset] = average.x + directionX * padding;
      positions[offset + 1] = average.y + directionY * padding;
      positions[offset + 2] = vertical * padding * flattening;
      const normalLength = Math.hypot(directionX, directionY, vertical / flattening);
      normals[offset] = directionX / normalLength;
      normals[offset + 1] = directionY / normalLength;
      normals[offset + 2] = vertical / flattening / normalLength;
      offset += 3;
    }
  }
  return { rings, segments, positions, normals } satisfies SampledSurface;
}

/** Reads one sample of a surface, for inspection. */
export function sampleAt(
  { segments, positions, normals }: SampledSurface,
  ring: number,
  segment: number,
) {
  const offset = (ring * (segments + 1) + segment) * 3;
  return {
    position: { x: positions[offset], y: positions[offset + 1], z: positions[offset + 2] },
    normal: { x: normals[offset], y: normals[offset + 1], z: normals[offset + 2] },
  };
}

/**
 * Writes into the result a weighted average of the points, favoring those reaching furthest in the given direction.
 * Taking the furthest point alone would give the exact convex hull, with flat sides and sharp corners;
 * the weighted average rounds it off. Writing into a reused result avoids allocating in this innermost loop.
 */
function averageTowards(
  points: PlanePoint[],
  directionX: number,
  directionY: number,
  sharpness: number,
  result: PlanePoint,
) {
  let furthest = Number.NEGATIVE_INFINITY;
  for (const point of points)
    furthest = Math.max(furthest, point.x * directionX + point.y * directionY);
  let totalWeight = 0;
  result.x = 0;
  result.y = 0;
  for (const point of points) {
    const weight = Math.exp(sharpness * (point.x * directionX + point.y * directionY - furthest));
    totalWeight += weight;
    result.x += point.x * weight;
    result.y += point.y * weight;
  }
  result.x /= totalWeight;
  result.y /= totalWeight;
}
