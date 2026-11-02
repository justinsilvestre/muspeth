import { describe, expect, it } from "vitest";
import { easeInOut, glidePositions } from "./glidePositions";

describe("glidePositions", () => {
  it("places a name part of the way between its old and new positions", () => {
    const from = new Map([["a", { x: 0, y: 0 }]]);
    const to = new Map([["a", { x: 4, y: 2 }]]);
    expect(glidePositions(from, to, 0.5).get("a")).toEqual({ x: 2, y: 1 });
  });

  it("starts a new name where it is going", () => {
    const to = new Map([["b", { x: 4, y: 2 }]]);
    expect(glidePositions(new Map(), to, 0.25).get("b")).toEqual({ x: 4, y: 2 });
  });
});

describe("easeInOut", () => {
  it("starts and ends in place", () => {
    expect([easeInOut(0), easeInOut(1)]).toEqual([0, 1]);
  });

  it("is halfway at the middle", () => {
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
  });
});
