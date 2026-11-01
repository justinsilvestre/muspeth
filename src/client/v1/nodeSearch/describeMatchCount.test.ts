import { describe, expect, it } from "vitest";
import { describeMatchCount } from "./describeMatchCount";

describe("describeMatchCount", () => {
  it("says when nothing matches", () => {
    expect(describeMatchCount(0, 0)).toBe("No matching nodes.");
  });

  it("counts a single match", () => {
    expect(describeMatchCount(1, 1)).toBe("1 matching node.");
  });

  it("counts every match when all are shown", () => {
    expect(describeMatchCount(12, 12)).toBe("12 matching nodes.");
  });

  it("says how many of the matches are shown", () => {
    expect(describeMatchCount(50, 1234)).toBe("Showing 50 of 1,234 matching nodes.");
  });
});
