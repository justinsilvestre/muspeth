import { describe, expect, it } from "vitest";
import { formatLatitude, formatLongitude } from "./formatCoordinates";

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
