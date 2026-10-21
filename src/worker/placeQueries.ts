import { type Coordinates, distanceKm } from "../shared/distanceKm";
import type { PlaceAndPeriodQuery, PlacedConnection } from "../shared/placeAndPeriodQuery";
import { connectionFilterSql } from "./connectionFilterSql";
import { type GraphEdgeRow, graphEdgeColumns, toGraphEdge } from "./graphEdgeRow";
import { allOf, type SqlCondition } from "./sqlCondition";
import type { SqlDatabase } from "./sqlDatabase";

type PlacedConnectionRow = GraphEdgeRow & {
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
};

const kmPerDegreeOfLatitude = 111.19;

/**
 * The start and end of a connection's date.
 * Each is the whole date when the date is not an interval.
 */
const dateStartSql =
  "CASE WHEN instr(date, '/') > 0 THEN substr(date, 1, instr(date, '/') - 1) ELSE date END";
const dateEndSql =
  "CASE WHEN instr(date, '/') > 0 THEN substr(date, instr(date, '/') + 1) ELSE date END";

/**
 * Lists the connections recorded near a place, within a period, or both.
 * Results near a place come nearest first; others come in order of date.
 */
export async function listConnectionsByPlaceAndPeriod(db: SqlDatabase, query: PlaceAndPeriodQuery) {
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

/** Keeps connections inside a box that encloses the circle, which an exact distance check then narrows. */
function boundingBoxSql({ latitude, longitude }: Coordinates, radiusKm: number) {
  const latitudeChange = radiusKm / kmPerDegreeOfLatitude;
  const latitudes = {
    sql: "latitude BETWEEN ? AND ? AND longitude IS NOT NULL",
    bindings: [latitude - latitudeChange, latitude + latitudeChange],
  } satisfies SqlCondition;
  const longitudeChange = maxLongitudeChange(latitude, radiusKm);
  return longitudeChange === null
    ? latitudes
    : allOf([latitudes, longitudeRangeSql(longitude, longitudeChange)]);
}

/** Returns how far in longitude a circle reaches from its centre, or null when it covers a pole. */
function maxLongitudeChange(latitude: number, radiusKm: number) {
  const angularRadius = radiusKm / kmPerDegreeOfLatitude;
  if (Math.abs(latitude) + angularRadius >= 90) return null;
  const toRadians = Math.PI / 180;
  const ratio = Math.sin(angularRadius * toRadians) / Math.cos(latitude * toRadians);
  return ratio >= 1 ? null : Math.asin(ratio) / toRadians;
}

function longitudeRangeSql(longitude: number, change: number) {
  const [west, east] = [longitude - change, longitude + change];
  if (west < -180) return { sql: "longitude >= ? OR longitude <= ?", bindings: [west + 360, east] };
  if (east > 180) return { sql: "longitude >= ? OR longitude <= ?", bindings: [west, east - 360] };
  return { sql: "longitude BETWEEN ? AND ?", bindings: [west, east] } satisfies SqlCondition;
}

/**
 * Keeps connections whose date overlaps the period. A connection's date is an ISO 8601 date,
 * or an interval such as "1990/1992", whose ends may be open ("1990/..") or empty ("/1992").
 * Years are compared as numbers, so that years before the common era, such as "-0500", come
 * before later ones.
 * Within one year, comparing text works for dates of different precision because "~" sorts after
 * every digit: a date such as "1990" ends at "1990~", after every day in 1990.
 */
function periodSql(from: string | null, to: string | null) {
  return allOf([
    { sql: "date IS NOT NULL AND date <> ''", bindings: [] },
    to ? startsByEndOfSql(to) : null,
    from ? endsByStartOfSql(from) : null,
  ]);
}

function startsByEndOfSql(to: string) {
  const year = toYearSql(dateStartSql);
  const toYear = Number.parseInt(to, 10);
  return {
    sql: `${year} IS NULL OR ${year} < ? OR (${year} = ? AND (${dateStartSql}) <= ?)`,
    bindings: [toYear, toYear, `${to}~`],
  } satisfies SqlCondition;
}

function endsByStartOfSql(from: string) {
  const year = toYearSql(dateEndSql);
  const fromYear = Number.parseInt(from, 10);
  return {
    sql: `${year} IS NULL OR ${year} > ? OR (${year} = ? AND (${dateEndSql}) || '~' >= ?)`,
    bindings: [fromYear, fromYear, from],
  } satisfies SqlCondition;
}

/** Reads the year of a date as a number, or null for an open or empty end of an interval. */
function toYearSql(dateSql: string) {
  return `(CASE WHEN (${dateSql}) IN ('', '..') THEN NULL ELSE CAST((${dateSql}) AS INTEGER) END)`;
}
