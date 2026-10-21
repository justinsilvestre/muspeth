import { describe, expect, it } from "vitest";
import { findNearestRadiusStep, radiusStepsKm } from "./radiusSteps";

describe("findNearestRadiusStep", () => {
  it("finds the step of a radius on the slider", () => {
    expect(radiusStepsKm[findNearestRadiusStep(50)]).toBe(50);
  });

  it("finds the nearest step of a radius between steps, comparing their ratios", () => {
    expect(radiusStepsKm[findNearestRadiusStep(35)]).toBe(25);
  });

  it("finds the last step for a radius beyond it", () => {
    expect(findNearestRadiusStep(20_000)).toBe(radiusStepsKm.length - 1);
  });
});
