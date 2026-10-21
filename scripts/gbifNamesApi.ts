import type { GbifMatch } from "./gbifTaxonomy.ts";
import { userAgent } from "./userAgent.ts";
import { type Checklist, type GbifVernacularName, toSpdxLicence } from "./vernacularNames.ts";

const apiUrl = "https://api.gbif.org/v1";
const headers = { "user-agent": userAgent };

/** Matches a scientific name against the GBIF backbone, listing the alternatives GBIF weighed. */
export async function fetchGbifMatch(scientificName: string) {
  const url = new URL(`${apiUrl}/species/match`);
  url.search = new URLSearchParams({ scientificName, verbose: "true" }).toString();
  return (await fetchJson(url)) as GbifMatch;
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
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GBIF responded ${response.status} for ${url}`);
  return response.json();
}
