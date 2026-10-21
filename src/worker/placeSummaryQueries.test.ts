import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../shared/connectionFilter";
import type { PlaceAndPeriodQuery } from "../shared/placeAndPeriodQuery";
import { listPlaceSummaries } from "./placeSummaryQueries";
import { insertConnections } from "./test/insertConnections";

const kyoto = { place: "Kyoto", latitude: 35.03, longitude: 135.78 };
const sapporo = { place: "Sapporo", latitude: 43.06, longitude: 141.35 };

function query(fields: Partial<PlaceAndPeriodQuery>) {
  return {
    near: null,
    radiusKm: 50,
    from: null,
    to: null,
    limit: 200,
    filter: emptyConnectionFilter,
    ...fields,
  } satisfies PlaceAndPeriodQuery;
}

async function insertPlacedConnections() {
  await insertConnections([
    { id: 1, sourceNodeId: "a", targetNodeId: "b", ...kyoto, date: "1990" },
    { id: 2, sourceNodeId: "a", targetNodeId: "c", ...kyoto, date: "2005" },
    { id: 3, sourceNodeId: "a", targetNodeId: "d", ...kyoto, kind: "likeness" },
    { id: 4, sourceNodeId: "a", targetNodeId: "e", ...sapporo, date: "2005" },
    { id: 5, sourceNodeId: "a", targetNodeId: "f" },
  ]);
}

describe("listPlaceSummaries", () => {
  it("counts the connections of each kind at each place", async () => {
    await insertPlacedConnections();
    expect(await listPlaceSummaries(env.DB, query({}))).toEqual([
      { ...kyoto, kind: "interaction", count: 2 },
      { ...kyoto, kind: "likeness", count: 1 },
      { ...sapporo, kind: "interaction", count: 1 },
    ]);
  });

  it("counts only the connections within the period", async () => {
    await insertPlacedConnections();
    const summaries = await listPlaceSummaries(env.DB, query({ from: "2005", to: "2005" }));
    expect(summaries.map(({ place, count }) => [place, count])).toEqual([
      ["Kyoto", 1],
      ["Sapporo", 1],
    ]);
  });

  it("counts every place, however far from the place searched", async () => {
    await insertPlacedConnections();
    const near = { latitude: 35.01, longitude: 135.77 };
    expect(await listPlaceSummaries(env.DB, query({ near, radiusKm: 1 }))).toHaveLength(3);
  });

  it("counts only the connections the filter keeps", async () => {
    await insertPlacedConnections();
    const filter = { ...emptyConnectionFilter, kinds: ["likeness" as const] };
    expect(await listPlaceSummaries(env.DB, query({ filter }))).toEqual([
      { ...kyoto, kind: "likeness", count: 1 },
    ]);
  });
});
