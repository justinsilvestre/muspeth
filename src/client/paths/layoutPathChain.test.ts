import { describe, expect, it } from "vitest";
import { layoutPathChain } from "./layoutPathChain";

describe("layoutPathChain", () => {
  describe("in a row", () => {
    it("spaces the nodes evenly from left to right", () => {
      const [first = 0, second = 0, third = 0] = layoutPathChain(3, "row").points.map(({ x }) => x);
      expect(third - second).toBe(second - first);
    });

    it("keeps every node at the same height", () => {
      const ys = new Set(layoutPathChain(3, "row").points.map(({ y }) => y));
      expect(ys.size).toBe(1);
    });

    it("makes the drawing as wide as the outer nodes and their margins", () => {
      const { points, width } = layoutPathChain(4, "row");
      expect(width).toBe((points[0]?.x ?? 0) + (points[3]?.x ?? 0));
    });
  });

  describe("in a column", () => {
    it("spaces the nodes evenly from top to bottom", () => {
      const [first = 0, second = 0, third = 0] = layoutPathChain(3, "column").points.map(
        ({ y }) => y,
      );
      expect(third - second).toBe(second - first);
    });

    it("makes the drawing as tall as the outer nodes and their margins", () => {
      const { points, height } = layoutPathChain(4, "column");
      expect(height).toBe((points[0]?.y ?? 0) + (points[3]?.y ?? 0));
    });
  });
});
