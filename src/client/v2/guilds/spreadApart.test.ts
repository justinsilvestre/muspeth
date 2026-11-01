import { describe, expect, it } from "vitest";
import { spreadApart } from "./spreadApart";

function distance(positions: Map<string, { x: number; y: number }>, a: string, b: string) {
  const p = positions.get(a) ?? { x: 0, y: 0 };
  const q = positions.get(b) ?? { x: 0, y: 0 };
  return Math.hypot(p.x - q.x, p.y - q.y);
}

describe("spreadApart", () => {
  it("separates points that lie in the same place", () => {
    const spread = spreadApart(
      new Map([
        ["a", { x: 0, y: 0 }],
        ["b", { x: 0, y: 0 }],
        ["c", { x: 0, y: 0 }],
      ]),
      0.5,
    );
    expect(
      Math.min(distance(spread, "a", "b"), distance(spread, "a", "c"), distance(spread, "b", "c")),
    ).toBeGreaterThanOrEqual(0.5 - 1e-9);
  });

  it("leaves points that are far enough apart where they are", () => {
    const spread = spreadApart(
      new Map([
        ["a", { x: 0, y: 0 }],
        ["b", { x: 3, y: 0 }],
      ]),
      0.5,
    );
    expect([spread.get("a"), spread.get("b")]).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ]);
  });
});
