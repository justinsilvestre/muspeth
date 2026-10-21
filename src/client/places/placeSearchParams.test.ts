import { describe, expect, it } from "vitest";
import {
  hopToDate,
  hopToPlace,
  searchAnytime,
  searchAnywhere,
  searchNear,
  searchRadius,
  searchWithin,
  toDateSummaryParams,
  toPlaceSummaryParams,
} from "./placeSearchParams";

const kyoto = { latitude: 35.0123, longitude: 135.7689 };

describe("searchNear", () => {
  it("sets the place searched", () => {
    expect(searchNear(new URLSearchParams(), kyoto).get("near")).toBe("35.012,135.769");
  });

  it("keeps the radius, period and filter", () => {
    const params = new URLSearchParams("radiusKm=10&from=1990&kind=likeness");
    expect(searchNear(params, kyoto).toString()).toBe(
      "radiusKm=10&from=1990&kind=likeness&near=35.012%2C135.769",
    );
  });

  it("leaves the given parameters unchanged", () => {
    const params = new URLSearchParams("from=1990");
    searchNear(params, kyoto);
    expect(params.has("near")).toBe(false);
  });
});

describe("toPlaceSummaryParams", () => {
  it("keeps the period and filter but not the place", () => {
    const params = new URLSearchParams("near=35,135&radiusKm=10&from=1990&kind=likeness");
    expect(toPlaceSummaryParams(params).toString()).toBe("from=1990&kind=likeness");
  });
});

describe("searchWithin", () => {
  it("sets the period searched, keeping the place", () => {
    const params = new URLSearchParams("near=35,135&from=1980");
    expect(searchWithin(params, { from: "1990", to: "1992" }).toString()).toBe(
      "near=35%2C135&from=1990&to=1992",
    );
  });
});

describe("searchAnytime", () => {
  it("removes the period, keeping the place", () => {
    const params = new URLSearchParams("near=35,135&from=1990&to=1992");
    expect(searchAnytime(params).toString()).toBe("near=35%2C135");
  });
});

describe("searchAnywhere", () => {
  it("removes the place, keeping the radius for the next one", () => {
    const params = new URLSearchParams("near=35,135&radiusKm=10&from=1990");
    expect(searchAnywhere(params).toString()).toBe("radiusKm=10&from=1990");
  });
});

describe("toDateSummaryParams", () => {
  it("keeps the place and filter but not the period", () => {
    const params = new URLSearchParams("near=35,135&radiusKm=10&from=1990&to=1992&kind=likeness");
    expect(toDateSummaryParams(params).toString()).toBe("near=35%2C135&radiusKm=10&kind=likeness");
  });
});

describe("searchRadius", () => {
  it("sets the radius, keeping the place", () => {
    const params = new URLSearchParams("near=35,135&radiusKm=50");
    expect(searchRadius(params, 10).toString()).toBe("near=35%2C135&radiusKm=10");
  });
});

describe("hopToPlace", () => {
  it("searches near the place at any time, keeping the radius and filter", () => {
    const params = new URLSearchParams("radiusKm=10&from=1990&kind=likeness");
    expect(hopToPlace(params, { latitude: 43.06, longitude: 141.35 }).toString()).toBe(
      "radiusKm=10&kind=likeness&near=43.06%2C141.35",
    );
  });
});

describe("hopToDate", () => {
  it("searches the date anywhere, keeping the filter", () => {
    const params = new URLSearchParams("near=35,135&kind=likeness");
    expect(hopToDate(params, "2005-07")?.toString()).toBe("kind=likeness&from=2005-07&to=2005-07");
  });

  it("searches the whole of an interval", () => {
    expect(hopToDate(new URLSearchParams(), "1990/1992")?.toString()).toBe("from=1990&to=1992");
  });

  it("leaves the open end of an interval open", () => {
    expect(hopToDate(new URLSearchParams(), "1990/..")?.toString()).toBe("from=1990");
  });

  it("does not search a date it cannot read", () => {
    expect(hopToDate(new URLSearchParams(), "circa 1990")).toBeNull();
  });
});
