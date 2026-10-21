import type { PlaceAndPeriodQuery } from "../shared/placeAndPeriodQuery";
import type { PlaceSummary } from "../shared/placeAndPeriodSummary";
import { connectionFilterSql } from "./connectionFilterSql";
import { periodSql } from "./periodSql";
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
