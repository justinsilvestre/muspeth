import { describe, expect, it } from "vitest";
import { pickHovered } from "./pickHovered";

const pair = {
  members: ["A", "B"],
  support: 1,
  supporters: ["ab"],
  cohesiveness: 1,
  subgroupiness: 1,
};
const trio = {
  members: ["A", "B", "C"],
  support: 1,
  supporters: ["abc"],
  cohesiveness: 1,
  subgroupiness: 1,
};

describe("pickHovered", () => {
  it("picks the subgroup with the fewest members among the hits", () => {
    const hits = [
      { object: { userData: { subgroup: trio } } },
      { object: { userData: { subgroup: pair } } },
    ];
    expect(pickHovered(hits)).toEqual({ kind: "subgroup", subgroup: pair });
  });

  it("prefers a language's nucleus over the membranes around it", () => {
    const hits = [
      { object: { userData: { subgroup: pair } } },
      { object: { userData: { language: "A" } } },
    ];
    expect(pickHovered(hits)).toEqual({ kind: "language", name: "A" });
  });

  it("ignores hits that stand for nothing", () => {
    expect(pickHovered([{ object: { userData: {} } }])).toBeUndefined();
  });
});
