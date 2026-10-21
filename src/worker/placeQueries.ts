import {
  type Coordinates,
  distanceKm,
  type PlaceAndPeriodQuery,
  type PlacedConnection,
} from "../shared/placeAndPeriodQuery";
import { boundingBoxSql } from "./boundingBoxSql";
import { connectionFilterSql } from "./connectionFilterSql";
import { type GraphEdgeRow, graphEdgeColumns, toGraphEdge } from "./graphEdgeRow";
import { dateStartSql, periodSql, toYearSql } from "./periodSql";
import { allOf } from "./sqlCondition";

type PlacedConnectionRow = GraphEdgeRow & {
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
};

/**
 * Lists the connections recorded near a place, within a period, or both.
 * Results near a place come nearest first; others come in order of date.
 */
export async function listConnectionsByPlaceAndPeriod(db: D1Database, query: PlaceAndPeriodQuery) {
  const condition = allOf([
    connectionFilterSql(query.filter),
    query.near ? boundingBoxSql(query.near, query.radiusKm) : null,
    query.from || query.to ? periodSql(query.from, query.to) : null,
  ]);
  // Results near a place are limited only after their exact distances are known.
  const limit = query.near ? -1 : query.limit;
  const { results } = await db
    .prepare(
      `SELECT ${graphEdgeColumns}, place, latitude, longitude, date FROM connections
       WHERE ${condition.sql} ORDER BY ${toYearSql(dateStartSql)}, date, id LIMIT ?`,
    )
    .bind(...condition.bindings, limit)
    .all<PlacedConnectionRow>();
  const connections = results.map((row) => toPlacedConnection(row, query.near));
  return query.near ? keepNearest(connections, query.radiusKm, query.limit) : connections;
}

function toPlacedConnection(row: PlacedConnectionRow, near: Coordinates | null) {
  const { place, latitude, longitude, date } = row;
  const distance =
    near && latitude !== null && longitude !== null
      ? distanceKm(near, { latitude, longitude })
      : null;
  return {
    ...toGraphEdge(row),
    ...{ place, latitude, longitude, date },
    distanceKm: distance,
  } satisfies PlacedConnection;
}

function keepNearest(connections: PlacedConnection[], radiusKm: number, limit: number) {
  return connections
    .filter(({ distanceKm }) => distanceKm !== null && distanceKm <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || a.id - b.id)
    .slice(0, limit);
}
