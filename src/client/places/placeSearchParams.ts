import { type Coordinates, formatNearParam } from "../../shared/placeAndPeriodQuery";

type Period = { from: string; to: string };

/** Returns the address's query with the place searched moved to the given point. */
export function searchNear(params: URLSearchParams, near: Coordinates) {
  return withParams(params, { near: formatNearParam(near) });
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
