import { describe, expect, it } from "vitest";
import { countRelatedPairs } from "./countRelatedPairs";

describe("countRelatedPairs", () => {
  it("counts each pair that shares something once", () => {
    const distances = [
      [0, 0.5, 1],
      [0.5, 0, 0.9],
      [1, 0.9, 0],
    ];
    expect(countRelatedPairs(distances)).toBe(2);
  });
});
