import { describe, expect, it } from "vitest";
import { families } from "./families";
import { scoreSubgroups } from "./scoreSubgroups";

const boni = families.find((family) => family.id === "boni");

/** Elias (2019: 84) works through the Bireeri–Safaree pair: five exclusive innovations, 17 supporting, 8 conflicting. */
describe("families", () => {
  it("reproduces the Boni paper's figures for the Southern Convergence Area", () => {
    const subgroup = scoreSubgroups(boni?.table ?? { languages: [], innovations: [] }).find(
      (candidate) => candidate.members.join() === "Bireeri,Safaree",
    );
    expect([subgroup?.support, subgroup?.cohesiveness]).toEqual([5, 17 / 25]);
  });

  it("gives every family a citation with a link", () => {
    expect(families.every((family) => family.citation.url.startsWith("https://"))).toBe(true);
  });
});
