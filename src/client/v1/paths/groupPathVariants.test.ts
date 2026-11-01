import { describe, expect, it } from "vitest";
import { groupPathVariants } from "./groupPathVariants";

function group(...routes: string[]) {
  const groups = groupPathVariants(routes.map((route) => ({ nodeIds: route.split(" ") })));
  return groups.map(({ paths, variantPosition }) => ({
    routes: paths.map(({ nodeIds }) => nodeIds.join(" ")),
    variantPosition,
  }));
}

describe("groupPathVariants", () => {
  it("keeps apart paths that differ by more than one node", () => {
    expect(group("a b c z", "a d e z").map(({ routes }) => routes)).toEqual([
      ["a b c z"],
      ["a d e z"],
    ]);
  });

  it("groups paths that differ only by one middle node, best first", () => {
    expect(group("a b c z", "a d z", "a e c z")[0]).toEqual({
      routes: ["a b c z", "a e c z"],
      variantPosition: 1,
    });
  });

  it("orders the groups by their best path", () => {
    expect(group("a b z", "a c d z", "a e z").map(({ routes }) => routes[0])).toEqual([
      "a b z",
      "a c d z",
    ]);
  });

  it("only groups a path with others that vary at the same position", () => {
    expect(group("a b c z", "a d c z", "a b e z").map(({ routes }) => routes)).toEqual([
      ["a b c z", "a d c z"],
      ["a b e z"],
    ]);
  });

  it("leaves a path without variants without a variant position", () => {
    expect(group("a b z")[0]?.variantPosition).toBeUndefined();
  });
});
