import { describe, expect, it } from "vitest";
import { type MangalGeometry, parseGeometry, toLatitudeLongitude } from "./mangalGeometry.ts";

const square = [
  [
    [10, 20],
    [12, 20],
    [12, 24],
    [10, 24],
    [10, 20],
  ],
];

describe("parseGeometry", () => {
  it("reads a point", () => {
    expect(parseGeometry({ type: "Point", coordinates: [138.38, 35.58] })).toEqual({
      type: "Point",
      coordinates: [138.38, 35.58],
    });
  });

  it("reads a polygon", () => {
    expect(parseGeometry({ type: "Polygon", coordinates: square })?.type).toBe("Polygon");
  });

  it("rejects a point without numbers", () => {
    expect(parseGeometry({ type: "Point", coordinates: ["a", "b"] })).toBeNull();
  });

  it("rejects a missing geometry", () => {
    expect(parseGeometry(null)).toBeNull();
  });
});

describe("toLatitudeLongitude", () => {
  it("reads a point's latitude from its second coordinate", () => {
    const point = { type: "Point", coordinates: [138.38, 35.58] } satisfies MangalGeometry;
    expect(toLatitudeLongitude(point)).toEqual({ latitude: 35.58, longitude: 138.38 });
  });

  it("places a polygon at its centroid", () => {
    const polygon = parseGeometry({ type: "Polygon", coordinates: square });
    expect(polygon && toLatitudeLongitude(polygon)).toEqual({ latitude: 22, longitude: 11 });
  });

  it("weights a polygon's centroid by area rather than by vertex", () => {
    const crowded = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 4],
        [0, 4],
        [0, 0],
      ],
    ];
    const polygon = parseGeometry({ type: "Polygon", coordinates: crowded });
    expect(polygon && toLatitudeLongitude(polygon)).toEqual({ latitude: 2, longitude: 2 });
  });
});
