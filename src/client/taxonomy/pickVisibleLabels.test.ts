import { describe, expect, it } from "vitest";
import { pickVisibleLabels } from "./pickVisibleLabels";

function makeLabel(id: string, left: number, top = 0) {
  return { id, rect: { left, top, width: 10, height: 10 } };
}

describe("pickVisibleLabels", () => {
  it("shows a label that overlaps no other", () => {
    expect(pickVisibleLabels([makeLabel("a", 0), makeLabel("b", 20)])).toEqual(new Set(["a", "b"]));
  });

  it("hides a label that overlaps one listed before it", () => {
    expect(pickVisibleLabels([makeLabel("a", 0), makeLabel("b", 5)])).toEqual(new Set(["a"]));
  });

  it("does not let a hidden label hide others", () => {
    const labels = [makeLabel("a", 0), makeLabel("b", 8), makeLabel("c", 16)];
    expect(pickVisibleLabels(labels)).toEqual(new Set(["a", "c"]));
  });
});
