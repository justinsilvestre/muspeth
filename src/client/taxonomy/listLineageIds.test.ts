import { describe, expect, it } from "vitest";
import { listLineageIds } from "./listLineageIds";

const parentIdsById = new Map([
  ["root", null],
  ["genus", "root"],
  ["species", "genus"],
  ["other", "root"],
]);

describe("listLineageIds", () => {
  it("lists the node and every ancestor up to the root", () => {
    expect(listLineageIds(parentIdsById, "species")).toEqual(new Set(["species", "genus", "root"]));
  });

  it("is empty when no node is given", () => {
    expect(listLineageIds(parentIdsById, null).size).toBe(0);
  });
});
