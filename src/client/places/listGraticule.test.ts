import { describe, expect, it } from "vitest";
import { formatLatitude, formatLongitude, listGraticule } from "./listGraticule";

const world = { west: -180, east: 180, south: -90, north: 90 };

describe("listGraticule", () => {
  it("draws the world's parallels every 30 degrees, leaving out the edges", () => {
    expect(listGraticule(world).latitudes).toEqual([-60, -30, 0, 30, 60]);
  });

  it("draws the world's meridians every 30 degrees, leaving out the edges", () => {
    expect(listGraticule(world).longitudes).toHaveLength(11);
  });

  it("draws finer lines in a small region", () => {
    const region = { west: 137.5, east: 139.3, south: 34.7, north: 36.5 };
    expect(listGraticule(region).latitudes).toEqual([35, 35.5, 36]);
  });
});

describe("formatLatitude", () => {
  it("names a northern latitude", () => {
    expect(formatLatitude(35.5)).toBe("35.5°N");
  });

  it("names a southern latitude", () => {
    expect(formatLatitude(-30)).toBe("30°S");
  });

  it("names the equator without a hemisphere", () => {
    expect(formatLatitude(0)).toBe("0°");
  });
});

describe("formatLongitude", () => {
  it("names a western longitude", () => {
    expect(formatLongitude(-120)).toBe("120°W");
  });

  it("names an eastern longitude", () => {
    expect(formatLongitude(138.5)).toBe("138.5°E");
  });
});
