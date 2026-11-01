import { describe, expect, it } from "vitest";
import { createBraidGeometry } from "./createBraidGeometry";

describe("createBraidGeometry", () => {
  describe("in a row", () => {
    it("runs from the start at the left to the end at the right", () => {
      const { toPoint } = createBraidGeometry("row", 1, 2);
      expect(toPoint({ x: 0, lane: 0 }).x).toBeLessThan(toPoint({ x: 1, lane: 0 }).x);
    });

    it("puts later lanes lower", () => {
      const { toPoint } = createBraidGeometry("row", 2, 2);
      expect(toPoint({ x: 0.5, lane: 0 }).y).toBeLessThan(toPoint({ x: 0.5, lane: 1 }).y);
    });
  });

  describe("in a column", () => {
    it("runs from the start at the top to the end at the bottom", () => {
      const { toPoint } = createBraidGeometry("column", 1, 2);
      expect(toPoint({ x: 0, lane: 0 }).y).toBeLessThan(toPoint({ x: 1, lane: 0 }).y);
    });

    it("centres the middle lane across the drawing", () => {
      const { toPoint, width } = createBraidGeometry("column", 3, 2);
      expect(toPoint({ x: 0.5, lane: 1 }).x).toBe(width / 2);
    });

    it("fits every lane within the drawing", () => {
      const { toPoint, width } = createBraidGeometry("column", 6, 4);
      expect(toPoint({ x: 0.5, lane: 5 }).x).toBeLessThan(width);
    });

    it("shortens labels to fit between lanes", () => {
      expect(createBraidGeometry("column", 6, 4).labelLength).toBeLessThan(
        createBraidGeometry("row", 6, 4).labelLength,
      );
    });
  });
});
