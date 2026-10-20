import type { ConnectionFilter } from "./connectionFilter";
import { parseConnectionFilter } from "./connectionFilter";
import type { GraphEdge } from "./graphExport";
import { InvalidQueryError, parseQuery, readNumber } from "./queryParameters";

export type Coordinates = { latitude: number; longitude: number };

/**
 * Which connections to find by where or when they were recorded.
 * `from` and `to` are ISO 8601 dates of a year, month or day, such as "1990" or "1990-05-03".
 */
export type PlaceAndPeriodQuery = {
  near: Coordinates | null;
  radiusKm: number;
  from: string | null;
  to: string | null;
  limit: number;
  filter: ConnectionFilter;
};

/** A connection found by place or period, with how far it lies from the place asked about. */
export type PlacedConnection = GraphEdge & {
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  licence: string;
  distanceKm: number | null;
};

export const defaultRadiusKm = 50;
const isoDatePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/** Reads a query such as `?near=35.0,135.7&radiusKm=20&from=1990&to=1992`, with a connection filter. */
export function parsePlaceAndPeriodQuery(params: URLSearchParams) {
  const filter = parseConnectionFilter(params);
  if (!filter.ok) return filter;
  return parseQuery(() => {
    const query = {
      near: readCoordinates(params.get("near")),
      radiusKm: readNumber(params, "radiusKm", [0, 20_000], defaultRadiusKm),
      from: readIsoDate(params.get("from"), "from"),
      to: readIsoDate(params.get("to"), "to"),
      limit: Math.round(readNumber(params, "limit", [1, 1000], 200)),
      filter: filter.value,
    } satisfies PlaceAndPeriodQuery;
    checkPlaceOrPeriod(query);
    return query;
  });
}

function readCoordinates(text: string | null) {
  if (!text) return null;
  const [latitude, longitude, ...rest] = text
    .split(",")
    .map((part) => (part.trim() === "" ? Number.NaN : Number(part)));
  if (latitude === undefined || longitude === undefined || rest.length > 0) {
    throw new InvalidQueryError('Expected near to be "latitude,longitude"');
  }
  if (!(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) {
    throw new InvalidQueryError("Expected near to lie within latitude ±90 and longitude ±180");
  }
  return { latitude, longitude } satisfies Coordinates;
}

function readIsoDate(text: string | null, name: string) {
  if (!text) return null;
  if (!isoDatePattern.test(text)) {
    throw new InvalidQueryError(
      `Expected ${name} to be a date such as 1990, 1990-05 or 1990-05-03`,
    );
  }
  return text;
}

function checkPlaceOrPeriod({ near, from, to }: PlaceAndPeriodQuery) {
  if (!near && !from && !to) {
    throw new InvalidQueryError("Give a place (near) or a period (from, to)");
  }
  // A date such as "1990" stands for the whole year, so "1990-05" to "1990" is a valid period.
  if (from && to && from > `${to}~`) throw new InvalidQueryError("Expected from to come before to");
}

/** Returns the great-circle distance between two points on the Earth, in kilometres. */
export function distanceKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeChange = toRadians(b.latitude - a.latitude);
  const longitudeChange = toRadians(b.longitude - a.longitude);
  const haversine =
    Math.sin(latitudeChange / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(longitudeChange / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(haversine)));
}
