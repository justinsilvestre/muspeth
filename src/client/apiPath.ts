/** Appends query parameters to an API path, leaving the path bare when there are none. */
export function apiPath(path: string, params: URLSearchParams) {
  return params.size > 0 ? `${path}?${params}` : path;
}
