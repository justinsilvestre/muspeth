import type { ArtworkMatch } from "./artworkSelection.ts";
import { searchClevelandTitles } from "./clevelandApi.ts";
import { matchClevelandTitle, toClevelandArtwork } from "./clevelandRecords.ts";
import { mapWithinBudget } from "./mapWithinBudget.ts";
import { fetchMetObject, searchMetTags } from "./metApi.ts";
import { listMetSearchTerms, matchMetObject, toMetArtwork } from "./metObjects.ts";
import { listSearchNames, type MuseumOrganism } from "./museumNames.ts";

const concurrency = 4;
const progressInterval = 50;

/**
 * The longest a museum's search may run. Searching stops after it, and the matches found so far
 * are kept, so that a slow or blocking museum cannot hold up the other imports.
 */
const budgetMilliseconds = 10 * 60 * 1000;

/** Wraps a per-organism search so that it reports how many organisms are done. */
function withProgress(
  museum: string,
  total: number,
  search: (organism: MuseumOrganism) => Promise<ArtworkMatch[]>,
) {
  let done = 0;
  return async (organism: MuseumOrganism) => {
    const matches = await search(organism);
    done++;
    if (done % progressInterval === 0)
      console.log(`${museum}: searched ${done} of ${total} organisms.`);
    return matches;
  };
}

/** Searches each organism's artworks at one museum until the time budget runs out. */
async function searchWithinBudget(
  museum: string,
  organisms: MuseumOrganism[],
  search: (organism: MuseumOrganism) => Promise<ArtworkMatch[]>,
) {
  const { results, skippedCount } = await mapWithinBudget(
    organisms,
    withProgress(museum, organisms.length, search),
    budgetMilliseconds,
    concurrency,
  );
  if (skippedCount > 0) {
    console.log(
      `${museum}: stopped early, as its ${budgetMilliseconds / 60_000} minutes ran out; ${skippedCount} of ${organisms.length} organisms were not searched.`,
    );
  }
  return results.flat();
}

/** Finds the Met's public domain objects whose subject tags match the organisms. */
export function collectMetMatches(organisms: MuseumOrganism[]) {
  return searchWithinBudget("met", organisms, collectMetMatchesFor);
}

async function collectMetMatchesFor(organism: MuseumOrganism) {
  const names = listSearchNames(organism);
  const qid = organism.id.match(/^wikidata:(Q\d+)$/)?.[1] ?? null;
  const objectIds = new Set<number>();
  const ancestorNames = organism.ancestors.flatMap((ancestor) => ancestor.names);
  const ancestorQids = organism.ancestors.map((ancestor) => ancestor.qid);
  for (const term of listMetSearchTerms(names, ancestorNames)) {
    for (const objectId of await searchMetTags(term)) objectIds.add(objectId);
  }
  const matches: ArtworkMatch[] = [];
  for (const objectId of objectIds) {
    const object = await fetchMetObject(objectId);
    const artwork = object && toMetArtwork(object);
    const by = object && matchMetObject(object, qid, names, ancestorQids);
    if (artwork && by) matches.push({ organismId: organism.id, artwork, by });
  }
  return matches;
}

/** Finds Cleveland's CC0 records with pictures whose titles mention the organisms' names. */
export function collectClevelandMatches(organisms: MuseumOrganism[]) {
  return searchWithinBudget("cleveland", organisms, collectClevelandMatchesFor);
}

async function collectClevelandMatchesFor(organism: MuseumOrganism) {
  const names = listSearchNames(organism);
  const matches: ArtworkMatch[] = [];
  for (const { name } of names) {
    for (const record of await searchClevelandTitles(name)) {
      const artwork = toClevelandArtwork(record);
      const by = matchClevelandTitle(record, names);
      if (artwork && by) matches.push({ organismId: organism.id, artwork, by });
    }
  }
  return matches;
}
