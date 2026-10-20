import { globiFields, parseGlobiTable } from "./globiRecords.ts";

const apiUrl = "https://api.globalbioticinteractions.org";

/** Fetches up to `limit` individual interaction records whose subject is exactly the named taxon. */
export async function fetchGlobiRecords(taxonName: string, limit: number) {
  const url = new URL("/interaction", apiUrl);
  url.searchParams.set("sourceTaxon", taxonName);
  url.searchParams.set("includeObservations", "true");
  url.searchParams.set("exactNameMatchOnly", "true");
  url.searchParams.set("limit", String(limit));
  for (const field of globiFields) url.searchParams.append("field", field);
  return parseGlobiTable((await fetchJson(url)) as Parameters<typeof parseGlobiTable>[0]);
}

/** Lists the links that GloBI gives for a taxon name to the same taxon in other databases. */
export async function fetchTaxonLinks(taxonName: string) {
  const url = new URL(`/taxonLinks/${encodeURIComponent(taxonName)}`, apiUrl);
  return (await fetchJson(url)) as (string | null)[];
}

async function fetchJson(url: URL) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GloBI responded ${response.status} for ${url}`);
  return response.json();
}
