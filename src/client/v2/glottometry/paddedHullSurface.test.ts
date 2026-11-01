import { describe, expect, it } from "vitest";
import { paddedHullSurface } from "./paddedHullSurface";

const twoPoints = [
  { x: -1, y: 0 },
  { x: 3, y: 0 },
];
const detail = { rings: 4, segments: 8 };
const round = { padding: 0.5, flattening: 1, cornerSharpness: 3 };
const flat = { ...round, flattening: 0.4 };

describe("paddedHullSurface", () => {
  it("returns one ring per latitude step, from pole to pole", () => {
    expect(paddedHullSurface(twoPoints, round, detail)).toHaveLength(5);
  });

  it("reaches nearly past the furthest point by the padding at the equator", () => {
    const equator = paddedHullSurface(twoPoints, round, detail)[2];
    expect(equator?.[0]?.position.x).toBeCloseTo(3.5, 4);
  });

  it("surrounds a single point with a ball of the padding's radius", () => {
    const equator = paddedHullSurface([{ x: 1, y: 2 }], round, detail)[2];
    expect(equator?.[2]?.position).toEqual({ x: 1, y: 2.5, z: 0 });
  });

  it("rises above the plane by the padding scaled by the flattening at the top pole", () => {
    const topPole = paddedHullSurface(twoPoints, flat, detail)[4];
    expect(topPole?.[0]?.position.z).toBeCloseTo(0.2);
  });

  it("points the normal along the sampling direction at the equator", () => {
    const equator = paddedHullSurface(twoPoints, flat, detail)[2];
    expect(equator?.[0]?.normal).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("keeps the normal straight up at the top pole however flattened the surface is", () => {
    const topPole = paddedHullSurface(twoPoints, flat, detail)[4];
    expect(topPole?.[0]?.normal.z).toBeCloseTo(1);
  });
});
