import { describe, expect, it } from "vitest";
import { scoreSubgroups } from "./scoreSubgroups";

const table = {
  languages: ["A", "B", "C", "D"],
  innovations: [
    { label: "ab", members: new Set(["A", "B"]) },
    { label: "ab again", members: new Set(["A", "B"]) },
    { label: "bc", members: new Set(["B", "C"]) },
    { label: "abc", members: new Set(["A", "B", "C"]) },
    { label: "a", members: new Set(["A"]) },
    { label: "all", members: new Set(["A", "B", "C", "D"]) },
  ],
};

function find(members: string[]) {
  return scoreSubgroups(table).find((subgroup) => subgroup.members.join() === members.join());
}

describe("scoreSubgroups", () => {
  it("leaves out single languages and the whole family", () => {
    expect(scoreSubgroups(table).map((subgroup) => subgroup.members)).toEqual([
      ["A", "B"],
      ["A", "B", "C"],
      ["B", "C"],
    ]);
  });

  it("counts innovations shared by exactly the members as support", () => {
    expect(find(["A", "B"])?.support).toBe(2);
  });

  it("measures cohesiveness as the share of related innovations that do not cut across the subgroup", () => {
    // AB is supported twice, compatible with "abc", "a", and "all", and cut across by "bc".
    expect(find(["A", "B"])?.cohesiveness).toBeCloseTo(5 / 6);
  });

  it("multiplies support by cohesiveness for subgroupiness", () => {
    // BC is supported once, compatible with "abc" and "all", and cut across by the two AB innovations.
    expect(find(["B", "C"])?.subgroupiness).toBeCloseTo(1 * (3 / 5));
  });
});
