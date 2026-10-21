import { fetchWithRetry } from "./fetchWithRetry.ts";
import { type SparqlRow, toSparqlRows } from "./sparqlRows.ts";
import { userAgent } from "./userAgent.ts";

export const wikidataEndpoint = "https://query.wikidata.org/sparql";

/** Wikidata keeps the scholarly articles that most references cite in a separate graph. */
export const scholarlyEndpoint = "https://query-scholarly.wikidata.org/sparql";

/** Runs a SPARQL query and returns its rows, waiting and retrying when the service is busy. */
export async function runSparql(endpoint: string, query: string): Promise<SparqlRow[]> {
  const response = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: {
      accept: "application/sparql-results+json",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": userAgent,
    },
    body: new URLSearchParams({ query }),
  });
  if (!response.ok) throw new Error(`${endpoint} responded ${response.status}`);
  const { results } = (await response.json()) as { results: { bindings: never[] } };
  return toSparqlRows(results.bindings);
}
