import { describe, expect, it } from "vitest";
import { hashToUnit } from "./hashToUnit";

describe("hashToUnit", () => {
  it("returns the same value for the same ID and purpose", () => {
    expect(hashToUnit("pine", "height")).toBe(hashToUnit("pine", "height"));
  });

  it("returns different values for different purposes", () => {
    expect(hashToUnit("pine", "height")).not.toBe(hashToUnit("pine", "angle"));
  });

  it("stays between -1 and 1", () => {
    const values = ["a", "b", "c", "d", "e"].map((id) => Math.abs(hashToUnit(id, "test")));
    expect(Math.max(...values)).toBeLessThanOrEqual(1);
  });
});
