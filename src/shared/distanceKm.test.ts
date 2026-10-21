import { describe, expect, it } from "vitest";
import { distanceKm } from "./distanceKm";

describe("distanceKm", () => {
  it("measures no distance between a point and itself", () => {
    expect(distanceKm({ latitude: 35, longitude: 135 }, { latitude: 35, longitude: 135 })).toBe(0);
  });

  it("measures about 111 km per degree of latitude", () => {
    const distance = distanceKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
    expect(Math.round(distance)).toBe(111);
  });

  it("measures the short way across the antimeridian", () => {
    const distance = distanceKm(
      { latitude: 0, longitude: 179.5 },
      { latitude: 0, longitude: -179.5 },
    );
    expect(Math.round(distance)).toBe(111);
  });
});
