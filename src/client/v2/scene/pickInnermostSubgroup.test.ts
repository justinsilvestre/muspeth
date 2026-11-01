import { describe, expect, it } from "vitest";
import { pickInnermostSubgroup } from "./pickInnermostSubgroup";

const pair = { members: ["A", "B"], support: 1, cohesiveness: 1, subgroupiness: 1 };
const trio = { members: ["A", "B", "C"], support: 1, cohesiveness: 1, subgroupiness: 1 };

describe("pickInnermostSubgroup", () => {
  it("picks the subgroup with the fewest members among the hits", () => {
    const hits = [
      { object: { userData: { subgroup: trio } } },
      { object: { userData: { subgroup: pair } } },
    ];
    expect(pickInnermostSubgroup(hits)).toBe(pair);
  });

  it("ignores hits that are not membranes", () => {
    expect(pickInnermostSubgroup([{ object: { userData: {} } }])).toBeUndefined();
  });
});
