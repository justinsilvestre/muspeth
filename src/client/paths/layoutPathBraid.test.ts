import { describe, expect, it } from "vitest";
import { layoutPathBraid } from "./layoutPathBraid";

function layOut(...routes: string[]) {
  return layoutPathBraid(routes.map((route) => ({ nodeIds: route.split(" ") })));
}

function placeOf(layout: ReturnType<typeof layoutPathBraid>, nodeId: string) {
  return layout.nodes.find((node) => node.nodeId === nodeId);
}

describe("layoutPathBraid", () => {
  it("puts the ends at either side, on the lane of the best path", () => {
    const layout = layOut("a b z", "a c z");
    const lane = placeOf(layout, "b")?.lane;
    expect([placeOf(layout, "a"), placeOf(layout, "z")]).toEqual([
      { nodeId: "a", x: 0, lane },
      { nodeId: "z", x: 1, lane },
    ]);
  });

  it("spaces the middle nodes of the best path evenly", () => {
    const layout = layOut("a b c d z");
    expect(["b", "c", "d"].map((id) => placeOf(layout, id)?.x)).toEqual([0.25, 0.5, 0.75]);
  });

  it("draws each node once", () => {
    const layout = layOut("a b z", "a c b z");
    expect(layout.nodes.map(({ nodeId }) => nodeId).sort()).toEqual(["a", "b", "c", "z"]);
  });

  it("keeps a shared node where the best path through it puts it", () => {
    const layout = layOut("a b z", "a c d b z");
    expect(placeOf(layout, "b")?.x).toBe(0.5);
  });

  it("spaces a later path's own nodes between the nodes it shares", () => {
    const layout = layOut("a b z", "a c d b z");
    expect(["c", "d"].map((id) => placeOf(layout, id)?.x)).toEqual([1 / 6, 2 / 6]);
  });

  it("gives each path's own nodes a lane of their own", () => {
    const layout = layOut("a b z", "a c z", "a d z");
    expect(new Set(["b", "c", "d"].map((id) => placeOf(layout, id)?.lane)).size).toBe(3);
  });

  it("puts paths that share no node on either side of the best path", () => {
    const layout = layOut("a b z", "a c z", "a d z");
    expect([placeOf(layout, "c")?.lane, placeOf(layout, "d")?.lane].sort()).toEqual([0, 2]);
  });

  it("puts a path beside the path it shares the most nodes with", () => {
    const layout = layOut("a b z", "a c z", "a d z", "a d e z");
    const [laneOfD = 0, laneOfE = 0] = ["d", "e"].map((id) => placeOf(layout, id)?.lane ?? 0);
    expect(Math.abs(laneOfD - laneOfE)).toBe(1);
  });

  it("counts the lanes", () => {
    expect(layOut("a b z", "a c z").laneCount).toBe(2);
  });

  it("draws a link that several paths share once, with the indexes of those paths", () => {
    const layout = layOut("a b z", "a c b z");
    expect(layout.links.filter(({ nodeIds }) => nodeIds.includes("z"))).toEqual([
      { nodeIds: ["b", "z"], pathIndexes: [0, 1] },
    ]);
  });
});
