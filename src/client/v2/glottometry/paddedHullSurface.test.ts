import { describe, expect, it } from "vitest";
import { paddedHullSurface } from "./paddedHullSurface";

const twoPoints = [
  { x: -1, y: 0 },
  { x: 3, y: 0 },
];

describe("paddedHullSurface", () => {
  it("returns one ring per latitude step, from pole to pole", () => {
    expect(paddedHullSurface(twoPoints, 0.5, 1, { rings: 4, segments: 8 })).toHaveLength(5);
  });

  it("reaches past the furthest point by the padding at the equator", () => {
    const equator = paddedHullSurface(twoPoints, 0.5, 1, { rings: 4, segments: 8 })[2];
    expect(equator?.[0]?.x).toBe(3.5);
  });

  it("rises above the plane by the padding scaled by the flattening at the top pole", () => {
    const topPole = paddedHullSurface(twoPoints, 0.5, 0.4, { rings: 4, segments: 8 })[4];
    expect(topPole?.[0]?.z).toBeCloseTo(0.2);
  });
});
