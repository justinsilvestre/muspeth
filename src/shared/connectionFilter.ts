import { connectionBases, connectionKinds } from "./graph";
import type { GraphEdge } from "./graphExport";
import { type QualityFlag, qualityFlags } from "./qualityFlags";
import { parseQuery, readStrings, readTerms } from "./queryParameters";

/** Which connections to keep; an empty list puts no limit on its field. */
export type ConnectionFilter = {
  kinds: GraphEdge["kind"][];
  bases: GraphEdge["basis"][];
  sources: string[];
  /** Keeps only connections that carry at least one of these flags. */
  flaggedWith: QualityFlag[];
  /** Leaves out connections that carry any of these flags. */
  notFlaggedWith: QualityFlag[];
};

export const emptyConnectionFilter = {
  kinds: [],
  bases: [],
  sources: [],
  flaggedWith: [],
  notFlaggedWith: [],
} satisfies ConnectionFilter;

/** The query parameter that holds each field of a filter, repeated once per value. */
export const connectionFilterParameters = {
  kinds: "kind",
  bases: "basis",
  sources: "source",
  flaggedWith: "flaggedWith",
  notFlaggedWith: "notFlaggedWith",
} as const satisfies Record<keyof ConnectionFilter, string>;

const qualityFlagNames = Object.keys(qualityFlags) as QualityFlag[];

/** Reads a filter from query parameters such as `?kind=interaction&notFlaggedWith=suspected_error`. */
export function parseConnectionFilter(params: URLSearchParams) {
  return parseQuery(
    () =>
      ({
        kinds: readTerms(params, connectionFilterParameters.kinds, connectionKinds),
        bases: readTerms(params, connectionFilterParameters.bases, connectionBases),
        sources: readStrings(params, connectionFilterParameters.sources),
        flaggedWith: readTerms(params, connectionFilterParameters.flaggedWith, qualityFlagNames),
        notFlaggedWith: readTerms(
          params,
          connectionFilterParameters.notFlaggedWith,
          qualityFlagNames,
        ),
      }) satisfies ConnectionFilter,
  );
}

/** Returns a copy of the query parameters with the filter's parameters replaced by the given filter. */
export function writeConnectionFilter(params: URLSearchParams, filter: ConnectionFilter) {
  const next = new URLSearchParams(params);
  for (const [field, name] of Object.entries(connectionFilterParameters)) {
    next.delete(name);
    for (const value of filter[field as keyof ConnectionFilter]) next.append(name, value);
  }
  return next;
}

/** Tells whether a connection passes the filter. */
export function matchesConnectionFilter(edge: GraphEdge, filter: ConnectionFilter) {
  const isAllowed = <Value>(allowed: Value[], value: Value) =>
    allowed.length === 0 || allowed.includes(value);
  return (
    isAllowed(filter.kinds, edge.kind) &&
    isAllowed(filter.bases, edge.basis) &&
    isAllowed(filter.sources, edge.source) &&
    (filter.flaggedWith.length === 0 ||
      filter.flaggedWith.some((flag) => edge.qualityFlags.includes(flag))) &&
    !filter.notFlaggedWith.some((flag) => edge.qualityFlags.includes(flag))
  );
}
