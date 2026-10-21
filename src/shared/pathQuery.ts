import { type ConnectionFilter, parseConnectionFilter } from "./connectionFilter";
import { defaultPathSearchOptions, type RankedPath } from "./findPaths";
import { parseQuery, readNumber, readRequiredString } from "./queryParameters";

/** The longest path the API searches for, which bounds how much of the graph it loads. */
export const maxPathSteps = 4;

/**
 * How many neighbours of each node a path search follows at most.
 * It bounds the connections loaded around a node with very many neighbours, such as a common word.
 */
export const pathNeighborLimit = 100;

/** Which paths to find, read from a query such as `?from=a&to=b&limit=5&maxSteps=3`. */
export type PathQuery = {
  fromId: string;
  toId: string;
  limit: number;
  maxSteps: number;
  filter: ConnectionFilter;
};

export type PathsResponse = { paths: RankedPath[] };

export function parsePathQuery(params: URLSearchParams) {
  const filter = parseConnectionFilter(params);
  if (!filter.ok) return filter;
  return parseQuery(
    () =>
      ({
        fromId: readRequiredString(params, "from"),
        toId: readRequiredString(params, "to"),
        limit: Math.round(readNumber(params, "limit", [1, 20], defaultPathSearchOptions.limit)),
        maxSteps: Math.round(readNumber(params, "maxSteps", [1, maxPathSteps], maxPathSteps)),
        filter: filter.value,
      }) satisfies PathQuery,
  );
}
