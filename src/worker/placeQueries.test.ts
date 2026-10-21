import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../shared/connectionFilter";
import type { PlaceAndPeriodQuery } from "../shared/placeAndPeriodQuery";
import { listConnectionsByPlaceAndPeriod } from "./placeQueries";
import { insertConnections } from "./test/insertConnections";

const kyoto = { latitude: 35.01, longitude: 135.77 };

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

async function listIds(fields: Partial<PlaceAndPeriodQuery>) {
  const connections = await listConnectionsByPlaceAndPeriod(env.DB, query(fields));
  return connections.map(({ id }) => id);
}

/** Inserts one connection for each date, numbered from 1. */
async function insertDated(dates: string[]) {
  await insertConnections(
    dates.map((date, index) => ({ id: index + 1, sourceNodeId: "a", targetNodeId: "b", date })),
  );
}

describe("listConnectionsByPlaceAndPeriod", () => {
  describe("near a place", () => {
    async function insertPlaces() {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", latitude: 35.03, longitude: 135.78 },
        { id: 2, sourceNodeId: "a", targetNodeId: "c", latitude: 34.69, longitude: 135.5 },
        { id: 3, sourceNodeId: "a", targetNodeId: "d", latitude: 43.06, longitude: 141.35 },
        { id: 4, sourceNodeId: "a", targetNodeId: "e" },
      ]);
    }

    it("lists the connections within the radius, nearest first", async () => {
      await insertPlaces();
      expect(await listIds({ near: kyoto })).toEqual([1, 2]);
    });

    it("leaves out connections beyond a smaller radius", async () => {
      await insertPlaces();
      expect(await listIds({ near: kyoto, radiusKm: 10 })).toEqual([1]);
    });

    it("measures how far each connection lies from the place", async () => {
      await insertPlaces();
      const [nearest] = await listConnectionsByPlaceAndPeriod(env.DB, query({ near: kyoto }));
      expect(nearest?.distanceKm).toBeCloseTo(2.4, 1);
    });

    it("keeps at most the given number of connections", async () => {
      await insertPlaces();
      expect(await listIds({ near: kyoto, limit: 1 })).toEqual([1]);
    });

    it("finds connections across the antimeridian", async () => {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", latitude: -16.5, longitude: -179.9 },
      ]);
      expect(await listIds({ near: { latitude: -16.5, longitude: 179.9 } })).toEqual([1]);
    });

    it("finds connections near a pole", async () => {
      await insertConnections([
        { id: 1, sourceNodeId: "a", targetNodeId: "b", latitude: 89.9, longitude: 0 },
      ]);
      expect(await listIds({ near: { latitude: 89.9, longitude: 180 } })).toEqual([1]);
    });
  });

  describe("within a period", () => {
    it("keeps a date inside the period", async () => {
      await insertDated(["1991-04-02", "1995"]);
      expect(await listIds({ from: "1990", to: "1992" })).toEqual([1]);
    });

    it("keeps an interval that overlaps the start of the period", async () => {
      await insertDated(["1988/1990"]);
      expect(await listIds({ from: "1990-12", to: "1992" })).toEqual([1]);
    });

    it("leaves out an interval that ends before the period", async () => {
      await insertDated(["1988/1989"]);
      expect(await listIds({ from: "1990" })).toEqual([]);
    });

    it("leaves out a date after the period", async () => {
      await insertDated(["1993-01-01"]);
      expect(await listIds({ to: "1992" })).toEqual([]);
    });

    it("keeps a year that contains the period", async () => {
      await insertDated(["1990"]);
      expect(await listIds({ from: "1990-05", to: "1990-06" })).toEqual([1]);
    });

    it("keeps an interval that is open at its end", async () => {
      await insertDated(["2000/.."]);
      expect(await listIds({ from: "2020" })).toEqual([1]);
    });

    it("keeps an interval whose start is left empty", async () => {
      await insertDated(["/1992"]);
      expect(await listIds({ to: "1950" })).toEqual([1]);
    });

    it("leaves out connections without a date", async () => {
      await insertConnections([{ id: 1, sourceNodeId: "a", targetNodeId: "b" }]);
      expect(await listIds({ from: "1990" })).toEqual([]);
    });

    it("orders connections by date", async () => {
      await insertDated(["1992", "1990"]);
      expect(await listIds({ from: "1980" })).toEqual([2, 1]);
    });

    describe("before the common era", () => {
      it("keeps a date inside the period", async () => {
        await insertDated(["-0500", "-0100"]);
        expect(await listIds({ from: "-0600", to: "-0400" })).toEqual([1]);
      });

      it("leaves out a date before the period", async () => {
        await insertDated(["-0500-03"]);
        expect(await listIds({ from: "-0400" })).toEqual([]);
      });

      it("keeps an interval that reaches into the period", async () => {
        await insertDated(["-0900/-0850"]);
        expect(await listIds({ from: "-0860", to: "0100" })).toEqual([1]);
      });

      it("orders earlier years first", async () => {
        await insertDated(["0100", "-0100", "-0500"]);
        expect(await listIds({ from: "-1000" })).toEqual([3, 2, 1]);
      });
    });
  });

  it("applies the connection filter", async () => {
    await insertConnections([
      { id: 1, sourceNodeId: "a", targetNodeId: "b", date: "1990", kind: "likeness" },
      { id: 2, sourceNodeId: "a", targetNodeId: "c", date: "1990" },
    ]);
    const filter = { ...emptyConnectionFilter, kinds: ["likeness" as const] };
    expect(await listIds({ from: "1990", filter })).toEqual([1]);
  });
});
