import { type Artwork, toYearInterval } from "./artworkDrafts.ts";
import { normalizeName, pluralize, type SearchName, toHeadword } from "./museumNames.ts";

/** The fields of a Met collection object that the import reads. */
export type MetObject = {
  objectID: number;
  isPublicDomain: boolean;
  primaryImageSmall: string;
  title: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  objectURL: string;
  objectWikidata_URL: string;
  artistDisplayName: string;
  accessionNumber: string;
  tags: { term: string; Wikidata_URL: string }[] | null;
};

/** The Met releases the pictures of public domain objects under CC0. */
const imageLicence = "CC0-1.0";

/**
 * Lists the subject tags to search for. The Met's tags are plural common names, such as "Bees",
 * so each common name is searched in both forms. The last word of a common name is searched too,
 * since the tag may name the plain kind of organism, as "Sunflowers" does for "common sunflower".
 * The names of taxa above the organism are searched too, as tags like "Bees" name a whole group.
 * Such tags count only when their Wikidata item is the organism's or an ancestor's: see
 * `matchMetObject`.
 */
export function listMetSearchTerms(names: SearchName[], ancestorNames: string[] = []) {
  const terms = names.flatMap(({ name, kind }) => {
    if (kind === "scientific") return [name];
    const headword = toHeadword(name);
    return [name, pluralize(name), ...(headword ? [headword, pluralize(headword)] : [])];
  });
  const ancestorTerms = ancestorNames.flatMap((name) => [name, pluralize(name)]);
  return [...new Set([...terms, ...ancestorTerms])];
}

/**
 * Converts a public domain object with a picture into an artwork, or nothing for any other object.
 * The node is the object's Wikidata item when the Met gives one, otherwise the Met's own number.
 */
export function toMetArtwork(object: MetObject) {
  if (!object.isPublicDomain || !object.primaryImageSmall) return null;
  const qid = object.objectWikidata_URL.match(/\/(Q\d+)$/)?.[1];
  return {
    id: qid ? `wikidata:${qid}` : `met:${object.objectID}`,
    title: object.title,
    url: object.objectURL,
    imageUrl: object.primaryImageSmall,
    imageLicence,
    date: toYearInterval(object.objectBeginDate, object.objectEndDate),
    citation: toCitation(object),
  } satisfies Artwork;
}

function toCitation(object: MetObject) {
  const parts = [object.title, object.artistDisplayName, object.objectDate].filter(Boolean);
  return `${parts.join(", ")}. The Metropolitan Museum of Art, ${object.accessionNumber}.`;
}

/**
 * Finds how an object's subject tags match an organism: by the organism's Wikidata item, else by
 * the item of a taxon above it, else by the tag naming the organism, else not at all.
 */
export function matchMetObject(
  object: MetObject,
  qid: string | null,
  names: SearchName[],
  ancestorQids: string[] = [],
) {
  const tags = object.tags ?? [];
  const hasItem = (itemQid: string) => tags.some((tag) => tag.Wikidata_URL.endsWith(`/${itemQid}`));
  if (qid && hasItem(qid)) return "id" as const;
  if (ancestorQids.some(hasItem)) return "ancestor" as const;
  for (const { name, kind } of names) {
    const forms = [normalizeName(name), normalizeName(pluralize(name))];
    if (tags.some((tag) => forms.includes(normalizeName(tag.term)))) return { name, kind };
  }
  return null;
}
