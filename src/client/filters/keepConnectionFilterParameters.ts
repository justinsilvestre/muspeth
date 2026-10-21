import { connectionFilterParameters } from "../../shared/connectionFilter";

const filterParameterNames = new Set<string>(Object.values(connectionFilterParameters));

/** Returns a copy of the query parameters with only the connection filter's parameters left. */
export function keepConnectionFilterParameters(params: URLSearchParams) {
  return new URLSearchParams([...params].filter(([name]) => filterParameterNames.has(name)));
}
