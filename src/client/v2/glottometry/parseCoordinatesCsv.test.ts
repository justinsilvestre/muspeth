import { describe, expect, it } from "vitest";
import { parseCoordinatesCsv } from "./parseCoordinatesCsv";

describe("parseCoordinatesCsv", () => {
  it("reads one language with its numeric position per row", () => {
    expect(parseCoordinatesCsv("lg name,latitude,longitude\rA,-3.1,36.5\r")).toEqual([
      { name: "A", latitude: -3.1, longitude: 36.5 },
    ]);
  });
});
