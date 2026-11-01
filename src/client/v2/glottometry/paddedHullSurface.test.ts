import { describe, expect, it } from "vitest";
import { paddedHullSurface } from "./paddedHullSurface";

const twoPoints = [
  { x: -1, y: 0 },
  { x: 3, y: 0 },
];
const detail = { rings: 4, segments: 8 };

describe("paddedHullSurface", () => {
  it("returns one ring per latitude step, from pole to pole", () => {
    expect(paddedHullSurface(twoPoints, 0.5, 1, detail)).toHaveLength(5);
  });

  it("reaches nearly past the furthest point by the padding at the equator", () => {
    const equator = paddedHullSurface(twoPoints, 0.5, 1, detail)[2];
    expect(equator?.[0]?.position.x).toBeCloseTo(3.5, 4);
  });

  it("surrounds a single point with a ball of the padding's radius", () => {
    const equator = paddedHullSurface([{ x: 1, y: 2 }], 0.5, 1, detail)[2];
    expect(equator?.[2]?.position).toEqual({ x: 1, y: 2.5, z: 0 });
  });

  it("rises above the plane by the padding scaled by the flattening at the top pole", () => {
    const topPole = paddedHullSurface(twoPoints, 0.5, 0.4, detail)[4];
    expect(topPole?.[0]?.position.z).toBeCloseTo(0.2);
  });

  it("points the normal along the sampling direction at the equator", () => {
    const equator = paddedHullSurface(twoPoints, 0.5, 0.4, detail)[2];
    expect(equator?.[0]?.normal).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("keeps the normal straight up at the top pole however flattened the surface is", () => {
    const topPole = paddedHullSurface(twoPoints, 0.5, 0.4, detail)[4];
    expect(topPole?.[0]?.normal.z).toBeCloseTo(1);
  });
});
