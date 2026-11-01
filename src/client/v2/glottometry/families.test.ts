import { describe, expect, it } from "vitest";
import { families } from "./families";
import { scoreSubgroups } from "./scoreSubgroups";

const boni = families.find((family) => family.id === "boni");
const germanic = families.find((family) => family.id === "germanic");

function supportOf(family: typeof boni, members: string) {
  return scoreSubgroups(family?.table ?? { languages: [], innovations: [] }).find(
    (candidate) => [...candidate.members].sort().join() === members,
  )?.support;
}

/** Elias (2019: 84) works through the Bireeri–Safaree pair: five exclusive innovations, 17 supporting, 8 conflicting. */
describe("families", () => {
  it("reproduces the Boni paper's figures for the Southern Convergence Area", () => {
    const subgroup = scoreSubgroups(boni?.table ?? { languages: [], innovations: [] }).find(
      (candidate) => candidate.members.join() === "Bireeri,Safaree",
    );
    expect([subgroup?.support, subgroup?.cohesiveness]).toEqual([5, 17 / 25]);
  });

  /** Agee (2018: 49) counts 9 exclusive innovations for Anglo-Frisian, 27 for Ingvaeonic and 13 for Teuto-Saxon. */
  it("reproduces the Germanic thesis's exclusive counts for its clear-cut subgroups", () => {
    expect([
      supportOf(germanic, "Old English,Old Frisian"),
      supportOf(germanic, "Old English,Old Frisian,Old Saxon"),
      supportOf(germanic, "Old High German,Old Saxon"),
    ]).toEqual([9, 27, 13]);
  });

  it("gives every family a citation with a link", () => {
    expect(families.every((family) => family.citation.url.startsWith("https://"))).toBe(true);
  });
});
