import { describe, expect, it } from "vitest";
import { membraneContour } from "./membraneContour";

describe("membraneContour", () => {
  it("surrounds a single point with a circle of the padding's radius", () => {
    const contour = membraneContour([{ x: 1, y: 2 }], 0.5, 4);
    expect(contour.map(({ x, y }) => Math.hypot(x - 1, y - 2))).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it("reaches past the furthest point in each direction by the padding", () => {
    const contour = membraneContour(
      [
        { x: -1, y: 0 },
        { x: 3, y: 0 },
      ],
      0.5,
      4,
    );
    expect(contour[0]?.x).toBe(3.5);
  });
});
