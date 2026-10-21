import { type GbifUsage, toExactMatch } from "./gbifTaxon.ts";
import type { GbifMatch } from "./gbifTaxonomy.ts";
import { userAgent } from "./userAgent.ts";
import { type Checklist, type GbifVernacularName, toSpdxLicence } from "./vernacularNames.ts";

const apiUrl = "https://api.gbif.org/v1";
const headers = { "user-agent": userAgent };

/**
 * Matches a scientific name against the GBIF backbone. Options may ask for the alternatives GBIF
 * weighed (`verbose`), or steer the match with higher taxa, such as a class.
 */
export async function fetchGbifMatch(scientificName: string, options: Record<string, string> = {}) {
  const url = new URL(`${apiUrl}/species/match`);
  url.search = new URLSearchParams({ ...options, scientificName }).toString();
  return (await fetchJson(url)) as GbifMatch;
}

/**
 * Looks up a GBIF taxon by its key, read as an exact match.
 * Returns null when GBIF no longer has the key.
 */
export async function fetchGbifMatchByKey(key: number) {
  const usage = (await fetchJsonOrNull(new URL(`${apiUrl}/species/${key}`))) as GbifUsage | null;
  return usage && toExactMatch(usage);
}

/** Lists the scientific names that GBIF treats as synonyms of a taxon. */
export async function fetchGbifSynonymNames(key: number) {
  const url = new URL(`${apiUrl}/species/${key}/synonyms`);
  url.searchParams.set("limit", "100");
  const { results = [] } = ((await fetchJsonOrNull(url)) ?? {}) as { results?: GbifUsage[] };
  return results.flatMap(({ canonicalName }) => (canonicalName ? [canonicalName] : []));
}

/** Fetches the vernacular names that the GBIF backbone holds for a taxon. */
export async function fetchVernacularNames(taxonKey: number) {
  const url = new URL(`${apiUrl}/species/${taxonKey}/vernacularNames`);
  url.searchParams.set("limit", "1000");
  return ((await fetchJson(url)) as { results: GbifVernacularName[] }).results;
}

/** Fetches the checklist that holds a checklist record of a taxon, with its licence. */
export async function fetchChecklist(sourceTaxonKey: number) {
  const { datasetKey } = (await fetchJson(new URL(`${apiUrl}/species/${sourceTaxonKey}`))) as {
    datasetKey: string;
  };
  const dataset = (await fetchJson(new URL(`${apiUrl}/dataset/${datasetKey}`))) as {
    title: string;
    license?: string;
  };
  return {
    datasetKey,
    title: dataset.title,
    licence: toSpdxLicence(dataset.license),
  } satisfies Checklist;
}

async function fetchJson(url: URL) {
  const body = await fetchJsonOrNull(url);
  if (body === null) throw new Error(`GBIF responded 404 for ${url}`);
  return body;
}

async function fetchJsonOrNull(url: URL) {
  const response = await fetch(url, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GBIF responded ${response.status} for ${url}`);
  return (await response.json()) as unknown;
}
