import { describe, expect, it } from "vitest";
import type { PollinationNetwork } from "./PollinationNetwork";
import { toSharingTable, visitCountSteps } from "./toSharingTable";

const network = {
  datasetId: "test",
  datasetUrl: "",
  place: "",
  date: null,
  latitude: null,
  longitude: null,
  licence: "CC0-1.0",
  citation: { text: "", url: "" },
  visitors: [
    { id: "bee", name: "Apis mellifera" },
    { id: "fly", name: "Musca domestica" },
  ],
  plants: [
    { id: "carrot", name: "Daucus carota" },
    { id: "clover", name: "Lotus corniculatus" },
    { id: "thistle", name: "Cirsium vulgare" },
  ],
  visits: [
    { visitor: "Apis mellifera", plant: "Daucus carota", count: 10, flags: [] },
    { visitor: "Apis mellifera", plant: "Lotus corniculatus", count: 2, flags: [] },
    { visitor: "Musca domestica", plant: "Daucus carota", count: 5, flags: [] },
  ],
} satisfies PollinationNetwork;

describe("toSharingTable", () => {
  it("lists the plants as the units when they are the bodies", () => {
    expect(toSharingTable(network, "plants").languages).toEqual([
      "Daucus carota",
      "Lotus corniculatus",
      "Cirsium vulgare",
    ]);
  });

  it("marks the plants each visitor was seen on", () => {
    expect(toSharingTable(network, "plants").innovations).toEqual([
      { label: "Apis mellifera", members: new Set(["Daucus carota", "Lotus corniculatus"]) },
      { label: "Musca domestica", members: new Set(["Daucus carota"]) },
    ]);
  });

  it("marks the visitors each plant was visited by when the visitors are the bodies", () => {
    expect(toSharingTable(network, "visitors").innovations).toEqual([
      { label: "Daucus carota", members: new Set(["Apis mellifera", "Musca domestica"]) },
      { label: "Lotus corniculatus", members: new Set(["Apis mellifera"]) },
    ]);
  });

  it("leaves out visits counted fewer times than the minimum", () => {
    expect(toSharingTable(network, "plants", 5).innovations).toEqual([
      { label: "Apis mellifera", members: new Set(["Daucus carota"]) },
      { label: "Musca domestica", members: new Set(["Daucus carota"]) },
    ]);
  });
});

describe("visitCountSteps", () => {
  it("lists each distinct count once, in rising order", () => {
    expect(visitCountSteps(network)).toEqual([2, 5, 10]);
  });
});
