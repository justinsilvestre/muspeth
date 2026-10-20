import { fetchGbifTaxon, matchGbifName } from "./gbifSpeciesApi.ts";
import { findGbifKey, type GbifTaxon } from "./gbifTaxon.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { fetchWikidataTaxa } from "./wikidataApi.ts";

/** An organism node in the graph, with what GBIF says about it. */
export type GraphOrganism = { id: string; label: string; gbif: GbifTaxon | null };

/**
 * Finds each organism in GBIF through its own identifier where it has one, which tells apart
 * namesakes in different kingdoms, and otherwise through its name.
 */
export async function classifyGraphOrganisms(organisms: { id: string; label: string }[]) {
  const qids = organisms.flatMap(({ id }) => (id.startsWith("wikidata:") ? [id.slice(9)] : []));
  const wikidataTaxa = await fetchWikidataTaxa(qids);
  return mapConcurrently(organisms, async (organism) => {
    const key = findGbifKey(organism.id, wikidataTaxa);
    const gbif =
      (key !== null && (await fetchGbifTaxon(key))) || (await matchGbifName(organism.label));
    return { ...organism, gbif } satisfies GraphOrganism;
  });
}
