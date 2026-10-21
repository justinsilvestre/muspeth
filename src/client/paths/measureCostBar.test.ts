import { describe, expect, it } from "vitest";
import { measureCostBar } from "./measureCostBar";

describe("measureCostBar", () => {
  it("gives a path's cost as a fraction of the worst cost in the list", () => {
    expect(measureCostBar(1, 4)).toBe(0.25);
  });

  it("fills the bar for the worst path", () => {
    expect(measureCostBar(4, 4)).toBe(1);
  });

  it("leaves the bar empty when no path costs anything", () => {
    expect(measureCostBar(0, 0)).toBe(0);
  });
});
