import { describe, expect, it } from "vitest";
import { chooseMapBounds, traceCircle } from "./placeMapGeometry";

const kushigata = { latitude: 35.5833, longitude: 138.3833 };

describe("traceCircle", () => {
  it("closes the outline by ending where it starts", () => {
    const outline = traceCircle(kushigata, 25);
    expect(outline.at(-1)).toEqual(outline[0]);
  });

  it("reaches as far north as the radius", () => {
    const northmost = Math.max(...traceCircle(kushigata, 111.2).map(([, latitude]) => latitude));
    expect(northmost).toBeCloseTo(kushigata.latitude + 1, 1);
  });
});

describe("chooseMapBounds", () => {
  describe("when a place was searched", () => {
    it("encloses the search radius", () => {
      const [[, south], [, north]] = chooseMapBounds(kushigata, 111.2, []) ?? [
        [0, 0],
        [0, 0],
      ];
      expect([south, north].map((latitude) => Number(latitude.toFixed(1)))).toEqual([34.6, 36.6]);
    });
  });

  describe("when only a period was searched", () => {
    it("encloses the places of the connections found", () => {
      const places = [
        { latitude: 35, longitude: 135 },
        { latitude: 43, longitude: 141 },
      ];
      expect(chooseMapBounds(null, 50, places)).toEqual([
        [135, 35],
        [141, 43],
      ]);
    });

    it("leaves the bounds open when no connection has a place", () => {
      expect(chooseMapBounds(null, 50, [])).toBeNull();
    });
  });
});
