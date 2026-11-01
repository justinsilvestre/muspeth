import { describe, expect, it } from "vitest";
import { bodySets, groupBodySets } from "./bodySets";
import { countMembranes } from "./toSharingTable";

describe("bodySets", () => {
  it("names only bodies of the set in its links", () => {
    const stray = bodySets.flatMap((set) => {
      const bodies = new Set(set.bodies.map(({ name }) => name));
      return set.sharings.flatMap(({ links }) => links.filter(({ body }) => !bodies.has(body)));
    });
    expect(stray).toEqual([]);
  });

  it("gives every set at least one relation that draws a membrane", () => {
    const bare = bodySets.filter(
      (set) => !set.sharings.some((sharing) => countMembranes(set, sharing) > 0),
    );
    expect(bare.map((set) => set.id)).toEqual([]);
  });

  it("lists the flower surveys first and the sets drawn from across the database last", () => {
    expect(groupBodySets(bodySets).map(([group]) => group)).toEqual([
      "From flower surveys",
      "From food webs",
      "From other studies",
      "From across the database",
    ]);
  });
});
