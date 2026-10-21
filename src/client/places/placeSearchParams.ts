import { type Coordinates, formatNearParam } from "../../shared/placeAndPeriodQuery";

/** Returns the address's query with the place searched moved to the given point. */
export function searchNear(params: URLSearchParams, near: Coordinates) {
  const next = new URLSearchParams(params);
  next.set("near", formatNearParam(near));
  return next;
}

/** Returns the parts of the address's query that choose which places to summarize: all but the place itself. */
export function toPlaceSummaryParams(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  for (const name of ["near", "radiusKm", "limit"]) next.delete(name);
  return next;
}
