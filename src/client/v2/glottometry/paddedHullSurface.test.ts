import { describe, expect, it } from "vitest";
import { paddedHullSurface, sampleAt } from "./paddedHullSurface";

const twoPoints = [
  { x: -1, y: 0 },
  { x: 3, y: 0 },
];
const detail = { rings: 4, segments: 8 };
const round = { padding: 0.5, flattening: 1, cornerSharpness: 3 };
const flat = { ...round, flattening: 0.4 };

describe("paddedHullSurface", () => {
  it("holds one sample per ring and segment, with the ring's first sample repeated at its end", () => {
    expect(paddedHullSurface(twoPoints, round, detail).positions).toHaveLength(5 * 9 * 3);
  });

  it("reaches nearly past the furthest point by the padding at the equator", () => {
    const equator = sampleAt(paddedHullSurface(twoPoints, round, detail), 2, 0);
    expect(equator.position.x).toBeCloseTo(3.5, 4);
  });

  it("surrounds a single point with a ball of the padding's radius", () => {
    const equator = sampleAt(paddedHullSurface([{ x: 1, y: 2 }], round, detail), 2, 2);
    expect(equator.position).toEqual({ x: 1, y: 2.5, z: 0 });
  });

  it("rises above the plane by the padding scaled by the flattening at the top pole", () => {
    const topPole = sampleAt(paddedHullSurface(twoPoints, flat, detail), 4, 0);
    expect(topPole.position.z).toBeCloseTo(0.2);
  });

  it("points the normal along the sampling direction at the equator", () => {
    const equator = sampleAt(paddedHullSurface(twoPoints, flat, detail), 2, 0);
    expect(equator.normal).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("keeps the normal straight up at the top pole however flattened the surface is", () => {
    const topPole = sampleAt(paddedHullSurface(twoPoints, flat, detail), 4, 0);
    expect(topPole.normal.z).toBeCloseTo(1);
  });
});
