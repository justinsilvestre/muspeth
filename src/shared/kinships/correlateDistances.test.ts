import { describe, expect, it } from "vitest";
import { correlateDistances } from "./correlateDistances";

const base = [
  [0, 0.1, 0.9],
  [0.1, 0, 0.8],
  [0.9, 0.8, 0],
];

describe("correlateDistances", () => {
  it("finds two identical groupings in full agreement", () => {
    expect(correlateDistances(base, base)).toBeCloseTo(1);
  });

  it("finds opposite groupings in full disagreement", () => {
    const opposite = base.map((row) => row.map((value) => (value === 0 ? 0 : 1 - value)));
    expect(correlateDistances(base, opposite)).toBeCloseTo(-1);
  });

  it("gives no agreement for a grouping that puts every pair at the same distance", () => {
    const flat = base.map((row) => row.map((value) => (value === 0 ? 0 : 1)));
    expect(correlateDistances(base, flat)).toBeNull();
  });
});
