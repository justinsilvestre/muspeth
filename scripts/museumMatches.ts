import type { ArtworkMatch } from "./artworkSelection.ts";
import { searchClevelandTitles } from "./clevelandApi.ts";
import { matchClevelandTitle, toClevelandArtwork } from "./clevelandRecords.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { fetchMetObject, searchMetTags } from "./metApi.ts";
import { listMetSearchTerms, matchMetObject, toMetArtwork } from "./metObjects.ts";
import { listSearchNames, type MuseumOrganism } from "./museumNames.ts";

const concurrency = 4;
const progressInterval = 50;

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

/** Finds the Met's public domain objects whose subject tags match the organisms. */
export async function collectMetMatches(organisms: MuseumOrganism[]) {
  const perOrganism = await mapConcurrently(
    organisms,
    withProgress("met", organisms.length, collectMetMatchesFor),
    concurrency,
  );
  return perOrganism.flat();
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
export async function collectClevelandMatches(organisms: MuseumOrganism[]) {
  const perOrganism = await mapConcurrently(
    organisms,
    withProgress("cleveland", organisms.length, collectClevelandMatchesFor),
    concurrency,
  );
  return perOrganism.flat();
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
