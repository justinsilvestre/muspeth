import { describe, expect, it } from "vitest";
import { choosePlotView, measurePlotHeight, projectPoint, projectRadius } from "./placePlotView";

const kushigata = { latitude: 35.5833, longitude: 138.3833 };

describe("choosePlotView", () => {
  it("shows the whole world when no place is given", () => {
    expect(choosePlotView(null, 50)).toMatchObject({
      west: -180,
      east: 180,
      south: -90,
      north: 90,
    });
  });

  it("centres the view on the place", () => {
    const { west, east } = choosePlotView(kushigata, 25);
    expect((west + east) / 2).toBeCloseTo(kushigata.longitude);
  });

  it("reaches four radii north of the place", () => {
    const { north } = choosePlotView(kushigata, 25);
    expect((north - kushigata.latitude) * 111.32).toBeCloseTo(100);
  });

  it("widens the view east and west so that the region it shows is square", () => {
    expect(measurePlotHeight(choosePlotView(kushigata, 25), 300)).toBeCloseTo(300);
  });

  it("stops at the poles", () => {
    expect(choosePlotView({ latitude: 89, longitude: 0 }, 1000).north).toBe(90);
  });
});

describe("measurePlotHeight", () => {
  it("makes the world twice as wide as it is tall", () => {
    expect(measurePlotHeight(choosePlotView(null, 50), 400)).toBe(200);
  });
});

describe("projectPoint", () => {
  it("places the meeting of the equator and the prime meridian at the centre of the world", () => {
    expect(projectPoint(choosePlotView(null, 50), { latitude: 0, longitude: 0 }, 400)).toEqual({
      x: 200,
      y: 100,
    });
  });

  it("places the north-west corner at the top left", () => {
    const view = choosePlotView(null, 50);
    expect(projectPoint(view, { latitude: 90, longitude: -180 }, 400)).toEqual({ x: 0, y: 0 });
  });
});

describe("projectRadius", () => {
  it("draws the radius as a circle in a view about the place", () => {
    const { rx, ry } = projectRadius(choosePlotView(kushigata, 25), kushigata, 25, 300);
    expect(rx).toBeCloseTo(ry);
  });

  it("draws a radius of a quarter of the view's height when the view is four radii from the place", () => {
    const { ry } = projectRadius(choosePlotView(kushigata, 25), kushigata, 25, 300);
    expect(ry).toBeCloseTo(300 / 8);
  });
});
