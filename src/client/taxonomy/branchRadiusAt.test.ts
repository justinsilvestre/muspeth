import { describe, expect, it } from "vitest";
import { branchRadiusAt, tipTaper } from "./branchRadiusAt";

const shape = { trunkRadius: 0.3, taperPerRank: 0.5 };

describe("branchRadiusAt", () => {
  it("is the trunk radius at the root", () => {
    expect(branchRadiusAt(0, shape)).toBe(0.3);
  });

  it("thins by the taper with each rank above the root", () => {
    expect(branchRadiusAt(2, shape)).toBeCloseTo(0.075);
  });

  it("flares only gently below the root", () => {
    expect(branchRadiusAt(-2, shape)).toBeLessThan(0.3 * 1.5);
  });
});

describe("tipTaper", () => {
  it("leaves the branch at full thickness before its last stretch", () => {
    expect(tipTaper(0.5, 0.25)).toBe(1);
  });

  it("narrows the branch to a point at its very end", () => {
    expect(tipTaper(1, 0.25)).toBe(0);
  });
});
