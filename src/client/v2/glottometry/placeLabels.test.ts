import { describe, expect, it } from "vitest";
import { placeLabels } from "./placeLabels";

describe("placeLabels", () => {
  it("puts a lone label to the lower right of its point", () => {
    const offsets = placeLabels([{ name: "A", text: "A", position: { x: 0, y: 0 } }], 0.4);
    expect(offsets.get("A")).toEqual({ dx: 0.4, dy: -0.4 });
  });

  it("moves the label of a point just below another to a different corner", () => {
    const offsets = placeLabels(
      [
        { name: "A", text: "Alpha", position: { x: 0, y: 0 } },
        { name: "B", text: "Beta", position: { x: 0.1, y: -0.3 } },
      ],
      0.4,
    );
    expect(offsets.get("B")).not.toEqual(offsets.get("A"));
  });

  it("leaves far-apart labels in the default corner", () => {
    const offsets = placeLabels(
      [
        { name: "A", text: "A", position: { x: 0, y: 0 } },
        { name: "B", text: "B", position: { x: 5, y: 5 } },
      ],
      0.4,
    );
    expect(offsets.get("B")).toEqual({ dx: 0.4, dy: -0.4 });
  });
});
