import { describe, expect, it } from "vitest";
import { collectAncestors } from "./taxonAncestors.ts";

const genus = "Q34740";
const family = "Q35409";
const order = "Q36602";

describe("collectAncestors", () => {
  const parents = new Map([
    ["species", ["genus"]],
    ["genus", ["clade"]],
    ["clade", ["family"]],
    ["family", ["order"]],
    ["order", ["class"]],
  ]);
  const ranks = new Map([
    ["genus", genus],
    ["family", family],
    ["order", order],
  ]);

  it("lists the ancestors from genus to family", () => {
    expect(collectAncestors("species", parents, ranks)).toEqual(["genus", "family"]);
  });

  it("goes through ancestors that have no rank", () => {
    expect(collectAncestors("genus", parents, ranks)).toEqual(["family"]);
  });

  it("does not list ancestors above family", () => {
    expect(collectAncestors("species", parents, ranks)).not.toContain("order");
  });

  it("finds nothing for an organism without parents", () => {
    expect(collectAncestors("unknown", parents, ranks)).toEqual([]);
  });
});
