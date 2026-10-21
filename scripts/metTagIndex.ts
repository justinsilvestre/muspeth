import { type ArtworkMatch, rankMatch } from "./artworkSelection.ts";
import { type MetObject, matchMetObject } from "./metObjects.ts";
import { listSearchNames, type MuseumOrganism, normalizeName, pluralize } from "./museumNames.ts";

/** The subject tags of the Met's public domain objects, looked up by Wikidata item or by term. */
export type MetTagIndex = {
  tagsByObjectId: Map<number, NonNullable<MetObject["tags"]>>;
  /** Object numbers under keys such as "qid:Q7391" and "term:bees". */
  objectIdsByKey: Map<string, number[]>;
};

/** An object of the Met that may depict an organism, and how its tags match the organism. */
export type MetCandidate = { objectId: number; by: ArtworkMatch["by"] };

export function createMetTagIndex() {
  return { tagsByObjectId: new Map(), objectIdsByKey: new Map() } satisfies MetTagIndex;
}

/**
 * Adds a row of the Met's open access CSV to the index, when the row is a public domain object
 * with subject tags. The CSV lists each tag's term and Wikidata address in matching order.
 */
export function addToMetTagIndex(index: MetTagIndex, row: Record<string, string>) {
  if (row["Is Public Domain"] !== "True" || !row.Tags) return;
  const objectId = Number(row["Object ID"]);
  const urls = (row["Tags Wikidata URL"] ?? "").split("|");
  const tags = row.Tags.split("|").map((term, i) => ({ term, Wikidata_URL: urls[i] ?? "" }));
  index.tagsByObjectId.set(objectId, tags);
  for (const { term, Wikidata_URL } of tags) {
    const qid = Wikidata_URL.match(/\/(Q\d+)$/)?.[1];
    for (const key of [`term:${normalizeName(term)}`, ...(qid ? [`qid:${qid}`] : [])]) {
      const objectIds = index.objectIdsByKey.get(key);
      if (objectIds) objectIds.push(objectId);
      else index.objectIdsByKey.set(key, [objectId]);
    }
  }
}

/**
 * Lists the objects whose tags match an organism, by its Wikidata item, an ancestor's item or one
 * of its names, the most certain matches first and then in the order of the Met's numbers.
 */
export function listMetCandidates(index: MetTagIndex, organism: MuseumOrganism) {
  const names = listSearchNames(organism);
  const qid = organism.id.match(/^wikidata:(Q\d+)$/)?.[1] ?? null;
  const ancestorQids = organism.ancestors.map((ancestor) => ancestor.qid);
  const terms = names.flatMap(({ name }) => [name, pluralize(name)].map(normalizeName));
  const keys = [
    ...[qid ?? "", ...ancestorQids].map((itemQid) => `qid:${itemQid}`),
    ...terms.map((term) => `term:${term}`),
  ];
  const objectIds = new Set(keys.flatMap((key) => index.objectIdsByKey.get(key) ?? []));
  return [...objectIds]
    .flatMap((objectId) => {
      const tags = index.tagsByObjectId.get(objectId) ?? null;
      const by = matchMetObject({ tags }, qid, names, ancestorQids);
      return by ? [{ objectId, by } satisfies MetCandidate] : [];
    })
    .toSorted((a, b) => rankMatch(a) - rankMatch(b) || a.objectId - b.objectId);
}
