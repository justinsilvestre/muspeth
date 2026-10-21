/** Stands in for the static assets binding, answering every request with a copy of the response. */
export function fakeAssets(response: Response) {
  return { fetch: async () => response.clone() } as unknown as Fetcher;
}
