import { describe, expect, it } from "vitest";
import { branchRadiusAt } from "./branchRadiusAt";
import type { BranchPath } from "./traceBranchPaths";
import { offsetStrand, strandRadiusAt } from "./trunkStrand";

const shape = { trunkRadius: 0.5, taperPerRank: 0.6 };

function makeStrand(trunkDirection: BranchPath["trunkDirection"]) {
  return {
    endId: "kingdom",
    nodeIds: ["kingdom"],
    positions: [
      [0, -2, 0],
      [0, 0, 0],
      [1, 1, 0],
    ],
    leadPosition: [0, -3, 0],
    trunkDirection,
    leafCount: 2,
  } satisfies BranchPath;
}

describe("offsetStrand", () => {
  it("moves the strand's base out toward its direction", () => {
    expect(offsetStrand(makeStrand([1, 0]), shape).positions[0]).toEqual([0.2, -2, 0]);
  });

  it("moves the strand's lead position along with its base", () => {
    expect(offsetStrand(makeStrand([1, 0]), shape).leadPosition).toEqual([0.2, -3, 0]);
  });

  it("leaves the strand's positions above the root in place", () => {
    expect(offsetStrand(makeStrand([1, 0]), shape).positions[2]).toEqual([1, 1, 0]);
  });

  it("leaves a lone strand on the axis", () => {
    expect(offsetStrand(makeStrand(null), shape).positions[0]).toEqual([0, -2, 0]);
  });
});

describe("strandRadiusAt", () => {
  it("is as thick as a branch one rank up where it meets the root", () => {
    expect(strandRadiusAt([0.2, 0, 0], [1, 0], 1, shape)).toBeCloseTo(0.3);
  });

  it("joins the ordinary radius at its end", () => {
    expect(strandRadiusAt([1, 1, 0], [1, 0], 1, shape)).toBeCloseTo(
      branchRadiusAt(Math.SQRT2, shape),
    );
  });

  it("flares toward the trunk's base", () => {
    expect(strandRadiusAt([0.2, -2, 0], [1, 0], 1, shape)).toBeGreaterThan(0.3);
  });
});
