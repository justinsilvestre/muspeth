import { type SparqlRow, toSparqlRows } from "./sparqlRows.ts";

export const wikidataEndpoint = "https://query.wikidata.org/sparql";

/** Wikidata keeps the scholarly articles that most references cite in a separate graph. */
export const scholarlyEndpoint = "https://query-scholarly.wikidata.org/sparql";

const userAgent = "muspeth-import (https://github.com/justinsilvestre/muspeth)";
const maxAttempts = 4;
const retryableStatuses = [429, 502, 503, 504];

/** Runs a SPARQL query and returns its rows, waiting and retrying when the service is busy. */
export async function runSparql(endpoint: string, query: string): Promise<SparqlRow[]> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/sparql-results+json",
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": userAgent,
      },
      body: new URLSearchParams({ query }),
    });
    if (response.ok) {
      const { results } = (await response.json()) as { results: { bindings: never[] } };
      return toSparqlRows(results.bindings);
    }
    if (attempt === maxAttempts || !retryableStatuses.includes(response.status)) {
      throw new Error(`${endpoint} responded ${response.status}`);
    }
    await sleep(Number(response.headers.get("retry-after") ?? attempt * 5) * 1000);
  }
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
