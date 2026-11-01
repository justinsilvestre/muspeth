import { describe, expect, it } from "vitest";
import { layoutLanguages } from "./layoutLanguages";

const coordinates = [
  { name: "west", latitude: 0, longitude: 10 },
  { name: "east", latitude: 1, longitude: 14 },
];

describe("layoutLanguages", () => {
  it("spreads the languages over the given extent along their longer axis", () => {
    expect(layoutLanguages(coordinates, 8).get("east")?.x).toBe(4);
  });

  it("keeps the shorter axis in proportion", () => {
    expect(layoutLanguages(coordinates, 8).get("east")?.y).toBe(1);
  });

  it("centers the languages on the origin", () => {
    expect(layoutLanguages(coordinates, 8).get("west")).toEqual({ x: -4, y: -1 });
  });
});
