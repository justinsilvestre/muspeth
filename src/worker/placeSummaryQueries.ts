import {
  type Coordinates,
  distanceKm,
  type PlaceAndPeriodQuery,
} from "../shared/placeAndPeriodQuery";
import type { DateSummary, PlaceSummary } from "../shared/placeAndPeriodSummary";
import { boundingBoxSql } from "./boundingBoxSql";
import { connectionFilterSql } from "./connectionFilterSql";
import { dateStartSql, periodSql, toYearSql } from "./periodSql";
import { allOf } from "./sqlCondition";

/** Counts the connections of each kind recorded at each place within the period, wherever the place lies. */
export async function listPlaceSummaries(db: D1Database, query: PlaceAndPeriodQuery) {
  const condition = allOf([
    connectionFilterSql(query.filter),
    { sql: "latitude IS NOT NULL AND longitude IS NOT NULL", bindings: [] },
    query.from || query.to ? periodSql(query.from, query.to) : null,
  ]);
  const { results } = await db
    .prepare(
      `SELECT latitude, longitude, max(place) AS place, kind, count(*) AS count FROM connections
       WHERE ${condition.sql} GROUP BY latitude, longitude, kind ORDER BY latitude, longitude, kind`,
    )
    .bind(...condition.bindings)
    .all<PlaceSummary>();
  return results;
}

type PlacedDateSummary = DateSummary & { latitude: number | null; longitude: number | null };

/**
 * Counts the connections of each kind recorded on each date near the place, whatever the period.
 * Dates come in the order of their start.
 */
export async function listDateSummaries(db: D1Database, query: PlaceAndPeriodQuery) {
  const condition = allOf([
    connectionFilterSql(query.filter),
    { sql: "date IS NOT NULL AND date <> ''", bindings: [] },
    query.near ? boundingBoxSql(query.near, query.radiusKm) : null,
  ]);
  // Places are kept apart until their exact distances are checked.
  const { results } = await db
    .prepare(
      `SELECT date, kind, latitude, longitude, count(*) AS count FROM connections
       WHERE ${condition.sql} GROUP BY date, kind, latitude, longitude
       ORDER BY ${toYearSql(dateStartSql)}, date, kind`,
    )
    .bind(...condition.bindings)
    .all<PlacedDateSummary>();
  const { near, radiusKm } = query;
  return mergeByDateAndKind(
    near ? results.filter((summary) => isWithin(summary, near, radiusKm)) : results,
  );
}

function isWithin({ latitude, longitude }: PlacedDateSummary, near: Coordinates, radiusKm: number) {
  return (
    latitude !== null && longitude !== null && distanceKm(near, { latitude, longitude }) <= radiusKm
  );
}

function mergeByDateAndKind(summaries: PlacedDateSummary[]) {
  const merged = new Map<string, DateSummary>();
  for (const { date, kind, count } of summaries) {
    const key = `${date} ${kind}`;
    merged.set(key, { date, kind, count: (merged.get(key)?.count ?? 0) + count });
  }
  return [...merged.values()];
}
