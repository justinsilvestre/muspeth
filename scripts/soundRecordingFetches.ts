import { fetchRecordedSpeciesKeysNear, fetchSoundOccurrences } from "./gbifOccurrenceApi.ts";
import { toGbifTaxon } from "./gbifTaxon.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { matchGraphOrganisms } from "./matchGraphOrganism.ts";
import { chooseRecordings, toMatchFlags, toRecordedTaxonKey } from "./soundRecordingChoice.ts";
import type { StudySite } from "./studySites.ts";

/** How many occurrences to choose an organism's recordings from. */
const occurrencesPerChoice = 20;

/** Fetches up to `count` recordings of each graph organism that GBIF places at species level. */
export async function fetchGraphOrganismRecordings(
  organisms: { id: string; label: string }[],
  count: number,
) {
  const matches = await matchGraphOrganisms(organisms);
  const species = matches.flatMap(({ node, match }) => {
    const gbif = toGbifTaxon(match);
    const taxonKey = toRecordedTaxonKey(gbif);
    if (!gbif || taxonKey === null) return [];
    return [{ organismId: node.id, taxonKey, qualityFlags: toMatchFlags(gbif) }];
  });
  return mapConcurrently(species, async (organism) => ({
    ...organism,
    recordings: chooseRecordings(
      await fetchSoundOccurrences(organism.taxonKey, occurrencesPerChoice),
      count,
    ),
  }));
}

/**
 * Fetches one recording made near each site of each of the `speciesPerSite` species most
 * recorded there, leaving out the species whose keys are known.
 */
export async function fetchSiteNeighbourRecordings(
  sites: StudySite[],
  knownSpeciesKeys: Set<number>,
  radiusKm: number,
  speciesPerSite: number,
) {
  const perSite = await mapConcurrently(sites, async (site) => {
    const near = { coordinates: site.coordinates, radiusKm };
    const speciesKeys = await fetchRecordedSpeciesKeysNear(
      near.coordinates,
      radiusKm,
      speciesPerSite,
    );
    const newKeys = speciesKeys.filter((key) => !knownSpeciesKeys.has(key));
    return mapConcurrently(newKeys, async (key) =>
      chooseRecordings(await fetchSoundOccurrences(key, occurrencesPerChoice, near), 1),
    );
  });
  return perSite.flat(2);
}
