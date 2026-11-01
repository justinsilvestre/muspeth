import { describe, expect, it } from "vitest";
import { layoutByLikeness } from "./layoutByLikeness";

const table = {
  languages: ["A", "B", "C", "D"],
  innovations: [
    { label: "ab", members: new Set(["A", "B"]) },
    { label: "ab again", members: new Set(["A", "B"]) },
    { label: "cd", members: new Set(["C", "D"]) },
    { label: "cd again", members: new Set(["C", "D"]) },
    { label: "a", members: new Set(["A"]) },
    { label: "c", members: new Set(["C"]) },
  ],
};

function distance(layout: Map<string, { x: number; y: number }>, a: string, b: string) {
  const p = layout.get(a) ?? { x: 0, y: 0 };
  const q = layout.get(b) ?? { x: 0, y: 0 };
  return Math.hypot(p.x - q.x, p.y - q.y);
}

describe("layoutByLikeness", () => {
  it("places languages sharing innovations closer than those sharing none", () => {
    const { positions } = layoutByLikeness(table, 8);
    expect(distance(positions, "A", "B")).toBeLessThan(distance(positions, "A", "C"));
  });

  it("spans the given extent on the longer axis", () => {
    const { positions } = layoutByLikeness(table, 8);
    const xs = [...positions.values()].map((p) => p.x);
    const ys = [...positions.values()].map((p) => p.y);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    expect(span).toBeCloseTo(8);
  });

  it("reports no geographic scale", () => {
    expect(layoutByLikeness(table, 8).unitsPerDegree).toBe(0);
  });
});
