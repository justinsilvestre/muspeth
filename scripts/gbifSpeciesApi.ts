import { type GbifUsage, toGbifTaxon } from "./gbifTaxon.ts";

const apiUrl = "https://api.gbif.org/v1/species";
const headers = { "user-agent": "muspeth-import (https://github.com/justinsilvestre/muspeth)" };

/** Looks up a GBIF taxon by its key, or returns null when GBIF no longer has the key. */
export async function fetchGbifTaxon(key: number) {
  const usage = (await fetchJson(new URL(`${apiUrl}/${key}`))) as GbifUsage | null;
  return usage && toGbifTaxon(usage);
}

/** Matches a scientific name against the GBIF backbone, steered by higher taxa such as a class. */
export async function matchGbifName(name: string, hints: Record<string, string> = {}) {
  const url = new URL(`${apiUrl}/match`);
  url.search = new URLSearchParams({ ...hints, scientificName: name }).toString();
  const usage = (await fetchJson(url)) as GbifUsage | null;
  return usage && toGbifTaxon(usage);
}

/** Lists the scientific names that GBIF treats as synonyms of a taxon. */
export async function fetchGbifSynonymNames(key: number) {
  const url = new URL(`${apiUrl}/${key}/synonyms`);
  url.searchParams.set("limit", "100");
  const { results = [] } = ((await fetchJson(url)) ?? {}) as { results?: GbifUsage[] };
  return results.flatMap(({ canonicalName }) => (canonicalName ? [canonicalName] : []));
}

async function fetchJson(url: URL) {
  const response = await fetch(url, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GBIF responded ${response.status} for ${url}`);
  return response.json();
}
