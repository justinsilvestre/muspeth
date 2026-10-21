import { type ArtworkMatch, artworksPerOrganism } from "./artworkSelection.ts";
import { searchClevelandTitles } from "./clevelandApi.ts";
import { matchClevelandTitle, toClevelandArtwork } from "./clevelandRecords.ts";
import { mapWithinBudget } from "./mapWithinBudget.ts";
import { fetchMetObject } from "./metApi.ts";
import { toMetArtwork } from "./metObjects.ts";
import { loadMetTagIndex } from "./metOpenAccessCsv.ts";
import { listMetCandidates, type MetCandidate } from "./metTagIndex.ts";
import { listSearchNames, type MuseumOrganism } from "./museumNames.ts";

const concurrency = 4;
const progressInterval = 50;

/**
 * The longest a museum's requests may run. No request starts after it, and the matches found so
 * far are kept, so that a slow or blocking museum cannot hold up the other imports.
 */
const budgetMilliseconds = 10 * 60 * 1000;

type Search<Item> = (item: Item, hasTimeLeft: () => boolean) => Promise<ArtworkMatch[]>;

/**
 * Wraps a search so that it reports how many searches are done, and so that a search whose
 * requests keep failing is skipped instead of stopping the import.
 */
function withProgress<Item>(museum: string, total: number, search: Search<Item>) {
  let done = 0;
  return async (item: Item, hasTimeLeft: () => boolean) => {
    const matches = await search(item, hasTimeLeft).catch((error: Error) => {
      console.log(`${museum}: skipped a search that failed: ${error.message}`);
      return [];
    });
    done++;
    if (done % progressInterval === 0) console.log(`${museum}: searched ${done} of ${total}.`);
    return matches;
  };
}

/** Runs one museum's searches until the time budget runs out. */
async function searchWithinBudget<Item>(museum: string, items: Item[], search: Search<Item>) {
  const { results, skippedCount } = await mapWithinBudget(
    items,
    withProgress(museum, items.length, search),
    budgetMilliseconds,
    concurrency,
  );
  if (skippedCount > 0) {
    console.log(
      `${museum}: stopped early, as its ${budgetMilliseconds / 60_000} minutes ran out; ${skippedCount} of ${items.length} searches were not run.`,
    );
  }
  return results.flat();
}

/**
 * Finds the Met's public domain objects whose subject tags match the organisms, from the Met's
 * open access CSV. Only the matched objects are fetched from the Met's API, for their pictures.
 */
export async function collectMetMatches(organisms: MuseumOrganism[]) {
  const index = await loadMetTagIndex();
  const searches = organisms
    .map((organism) => ({ organism, candidates: listMetCandidates(index, organism) }))
    .filter(({ candidates }) => candidates.length > 0);
  console.log(`met: the open access CSV tags objects for ${searches.length} organisms.`);
  return searchWithinBudget("met", searches, collectMetMatchesFor);
}

/** Fetches the candidates in order until enough have a public domain picture. */
async function collectMetMatchesFor(
  { organism, candidates }: { organism: MuseumOrganism; candidates: MetCandidate[] },
  hasTimeLeft: () => boolean,
) {
  const matches: ArtworkMatch[] = [];
  for (const { objectId, by } of candidates) {
    if (matches.length >= artworksPerOrganism || !hasTimeLeft()) break;
    const object = await fetchMetObject(objectId);
    const artwork = object && toMetArtwork(object);
    if (artwork) matches.push({ organismId: organism.id, artwork, by });
  }
  return matches;
}

/** Finds Cleveland's CC0 records with pictures whose titles mention the organisms' names. */
export function collectClevelandMatches(organisms: MuseumOrganism[]) {
  return searchWithinBudget("cleveland", organisms, collectClevelandMatchesFor);
}

async function collectClevelandMatchesFor(organism: MuseumOrganism, hasTimeLeft: () => boolean) {
  const names = listSearchNames(organism);
  const matches: ArtworkMatch[] = [];
  for (const { name } of names) {
    if (!hasTimeLeft()) break;
    for (const record of await searchClevelandTitles(name)) {
      const artwork = toClevelandArtwork(record);
      const by = matchClevelandTitle(record, names);
      if (artwork && by) matches.push({ organismId: organism.id, artwork, by });
    }
  }
  return matches;
}
