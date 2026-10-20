import type { GlobiTaxonPath } from "./gbifLineageHints.ts";
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

/** Lists the taxon paths that GloBI's records give for exactly the named taxon, one per record. */
export async function fetchGlobiTaxonPaths(taxonName: string, limit: number) {
  const url = new URL("/interaction", apiUrl);
  url.searchParams.set("sourceTaxon", taxonName);
  url.searchParams.set("exactNameMatchOnly", "true");
  url.searchParams.set("limit", String(limit));
  for (const field of ["source_taxon_name", "source_taxon_path", "source_taxon_path_ranks"]) {
    url.searchParams.append("field", field);
  }
  const { data } = (await fetchJson(url)) as { data: (string | null)[][] };
  return data.flatMap(([name, names, ranks]) =>
    name === taxonName && names ? [{ names, ranks: ranks ?? null } satisfies GlobiTaxonPath] : [],
  );
}

/** Lists the Wikidata items that GloBI links to a taxon name, for example ["Q1044186"]. */
export async function fetchWikidataQids(taxonName: string) {
  const links = await fetchJson(new URL(`/taxonLinks/${encodeURIComponent(taxonName)}`, apiUrl));
  return (links as (string | null)[]).flatMap(
    (link) => link?.match(/wikidata\.org\/wiki\/(Q\d+)$/)?.[1] ?? [],
  );
}

async function fetchJson(url: URL) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GloBI responded ${response.status} for ${url}`);
  return response.json();
}
