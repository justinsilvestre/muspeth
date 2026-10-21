import { describe, expect, it } from "vitest";
import { findNearestSite, type LocatedObservation, toStudySites } from "./studySites.ts";

function makeObservation(overrides: Partial<LocatedObservation> = {}) {
  return {
    nodeId: "wikidata:Q30034",
    place: "Grassland at Mt. Yufu, Japan",
    latitude: 33.4,
    longitude: 131.5,
    licence: "CC0-1.0",
    datasetId: "mangal:1",
    datasetCitation: "Mangal network 1.",
    studyCitation: "Kato 1993.",
    studyUrl: null,
    ...overrides,
  } satisfies LocatedObservation;
}

describe("toStudySites", () => {
  it("makes one place for interactions recorded at the same coordinates", () => {
    const observations = [makeObservation(), makeObservation({ nodeId: "wikidata:Q1" })];
    expect(toStudySites(observations).sites.map(({ node }) => node.id)).toEqual([
      "site:33.400,131.500",
    ]);
  });

  it("names the place as the source does", () => {
    expect(toStudySites([makeObservation()]).sites[0]?.node.label).toBe(
      "Grassland at Mt. Yufu, Japan",
    );
  });

  it("links an organism to a place once, however many interactions it has there", () => {
    const observations = [makeObservation(), makeObservation()];
    expect(toStudySites(observations).connections).toHaveLength(1);
  });

  it("keeps each source of the organism's interactions at the place", () => {
    const observations = [makeObservation(), makeObservation({ datasetId: "web-of-life:M_PL_1" })];
    expect(toStudySites(observations).connections[0]?.sources).toHaveLength(2);
  });
});

describe("findNearestSite", () => {
  const { sites } = toStudySites([
    makeObservation(),
    makeObservation({ latitude: 35.583, longitude: 138.383 }),
  ]);

  it("finds the nearest site within the radius", () => {
    const nearest = findNearestSite({ latitude: 33.5, longitude: 131.5 }, sites, 50);
    expect(nearest?.site.node.id).toBe("site:33.400,131.500");
  });

  it("finds nothing when every site lies beyond the radius", () => {
    expect(findNearestSite({ latitude: 0, longitude: 0 }, sites, 50)).toBeNull();
  });
});
