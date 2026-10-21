import { describe, expect, it } from "vitest";
import {
  distanceKm,
  formatNearParam,
  parseOptionalPlaceAndPeriodQuery,
  parsePlaceAndPeriodQuery,
} from "./placeAndPeriodQuery";

function parse(query: string) {
  return parsePlaceAndPeriodQuery(new URLSearchParams(query));
}

describe("parsePlaceAndPeriodQuery", () => {
  it("reads a place as latitude and longitude", () => {
    const result = parse("near=35.03,135.78");
    expect(result.ok && result.value.near).toEqual({ latitude: 35.03, longitude: 135.78 });
  });

  it("searches within 50 km of a place by default", () => {
    const result = parse("near=35,135");
    expect(result.ok && result.value.radiusKm).toBe(50);
  });

  it("reads a radius", () => {
    const result = parse("near=35,135&radiusKm=12.5");
    expect(result.ok && result.value.radiusKm).toBe(12.5);
  });

  it("reads a period", () => {
    const result = parse("from=1990&to=1992-06-30");
    expect(result.ok && [result.value.from, result.value.to]).toEqual(["1990", "1992-06-30"]);
  });

  it("reads a period open at one end", () => {
    const result = parse("from=1990-05");
    expect(result.ok && result.value.to).toBeNull();
  });

  it("reads a connection filter alongside", () => {
    const result = parse("from=1990&kind=likeness");
    expect(result.ok && result.value.filter.kinds).toEqual(["likeness"]);
  });

  it("accepts a period that ends within the year it starts in", () => {
    expect(parse("from=1990-05&to=1990").ok).toBe(true);
  });

  it("rejects a query with neither place nor period", () => {
    expect(parse("radiusKm=10").ok).toBe(false);
  });

  it("rejects a place with one coordinate", () => {
    expect(parse("near=35").ok).toBe(false);
  });

  it("rejects a place with an empty coordinate", () => {
    expect(parse("near=35,").ok).toBe(false);
  });

  it("rejects a latitude beyond the poles", () => {
    expect(parse("near=95,135").ok).toBe(false);
  });

  it("rejects a negative radius", () => {
    expect(parse("near=35,135&radiusKm=-1").ok).toBe(false);
  });

  it("rejects a date that is not ISO 8601", () => {
    expect(parse("from=May 1990").ok).toBe(false);
  });

  it("rejects a period that ends before it starts", () => {
    expect(parse("from=1992&to=1990").ok).toBe(false);
  });

  it("accepts a period of years before the common era", () => {
    expect(parse("from=-0500&to=-0100").ok).toBe(true);
  });

  it("rejects a period of years before the common era that ends before it starts", () => {
    expect(parse("from=-0100&to=-0500").ok).toBe(false);
  });

  it("rejects an invalid connection filter", () => {
    expect(parse("from=1990&kind=friendship").ok).toBe(false);
  });
});

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

describe("parseOptionalPlaceAndPeriodQuery", () => {
  it("accepts a query with neither place nor period", () => {
    expect(parseOptionalPlaceAndPeriodQuery(new URLSearchParams("kind=likeness")).ok).toBe(true);
  });

  it("still rejects a period that ends before it starts", () => {
    const params = new URLSearchParams("from=1992&to=1990");
    expect(parseOptionalPlaceAndPeriodQuery(params).ok).toBe(false);
  });
});

describe("formatNearParam", () => {
  it("rounds each coordinate to three decimal places", () => {
    expect(formatNearParam({ latitude: 35.012345, longitude: -135.77 })).toBe("35.012,-135.77");
  });
});
