import { type Coordinates, formatNearParam, isIsoDate } from "../../shared/placeAndPeriodQuery";

type Period = { from: string | null; to: string | null };

/** Returns the address's query with the place searched moved to the given point. */
export function searchNear(params: URLSearchParams, near: Coordinates) {
  return withParams(params, { near: formatNearParam(near) });
}

/** Returns the address's query with the radius about the place replaced. */
export function searchRadius(params: URLSearchParams, radiusKm: number) {
  return withParams(params, { radiusKm: String(radiusKm) });
}

/** Returns the address's query with the period searched replaced. */
export function searchWithin(params: URLSearchParams, { from, to }: Period) {
  return withParams(params, { from, to });
}

/** Returns the address's query without a period, keeping the place. */
export function searchAnytime(params: URLSearchParams) {
  return withParams(params, { from: null, to: null });
}

/** Returns the address's query without a place, keeping the period and the radius. */
export function searchAnywhere(params: URLSearchParams) {
  return withParams(params, { near: null });
}

/** Returns the address's query searching near a place at any time, as when moving on from a connection found there. */
export function hopToPlace(params: URLSearchParams, place: Coordinates) {
  return searchAnytime(searchNear(params, place));
}

/**
 * Returns the address's query searching a connection's date anywhere, as when moving on from a connection recorded then,
 * or null when the date cannot be read.
 * The date may be an interval such as "1990/1992", whose ends may be open ("1990/..") or empty ("/1992").
 */
export function hopToDate(params: URLSearchParams, date: string) {
  const [first = "", last = first] = date.split("/");
  const readEnd = (end: string) => (end === "" || end === ".." ? null : end);
  const [from, to] = [readEnd(first), readEnd(last)];
  const ends = [from, to].filter((end) => end !== null);
  if (ends.length === 0 || !ends.every(isIsoDate)) return null;
  return searchAnywhere(searchWithin(params, { from, to }));
}

/** Returns the parts of the address's query that choose which places to summarize: all but the place itself. */
export function toPlaceSummaryParams(params: URLSearchParams) {
  return withParams(params, { near: null, radiusKm: null, limit: null });
}

/** Returns the parts of the address's query that choose which dates to summarize: all but the period itself. */
export function toDateSummaryParams(params: URLSearchParams) {
  return withParams(params, { from: null, to: null, limit: null });
}

/** Copies the query, setting each parameter given a value and removing each given null. */
function withParams(params: URLSearchParams, changes: Record<string, string | null>) {
  const next = new URLSearchParams(params);
  for (const [name, value] of Object.entries(changes)) {
    if (value === null) next.delete(name);
    else next.set(name, value);
  }
  return next;
}
