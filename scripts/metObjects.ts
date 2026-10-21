import { type Artwork, toYearInterval } from "./artworkDrafts.ts";
import { normalizeName, pluralize, type SearchName } from "./museumNames.ts";

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
    date: toMetDate(object),
    citation: toCitation(object),
  } satisfies Artwork;
}

/**
 * Dates an object by its years,
 * or not at all when the Met gives 0 for both, as it does for undated objects.
 */
function toMetDate({ objectBeginDate, objectEndDate }: MetObject) {
  if (objectBeginDate === 0 && objectEndDate === 0) return null;
  return toYearInterval(objectBeginDate, objectEndDate);
}

function toCitation(object: MetObject) {
  const parts = [object.title, object.artistDisplayName, object.objectDate].filter(Boolean);
  return `${parts.join(", ")}. The Metropolitan Museum of Art, ${object.accessionNumber}.`;
}

/**
 * Finds how an object's subject tags match an organism: by the organism's Wikidata item, else by
 * the item of a taxon above it, else by a tag without an item naming the organism, else not at
 * all. A tag whose item is another's names something else, as "Queens" does for the queen butterfly.
 */
export function matchMetObject(
  object: Pick<MetObject, "tags">,
  qid: string | null,
  names: SearchName[],
  ancestorQids: string[] = [],
) {
  const tags = object.tags ?? [];
  const hasItem = (itemQid: string) => tags.some((tag) => tag.Wikidata_URL.endsWith(`/${itemQid}`));
  if (qid && hasItem(qid)) return "id" as const;
  if (ancestorQids.some(hasItem)) return "ancestor" as const;
  const termsWithoutItem = tags
    .filter((tag) => !/\/Q\d+$/.test(tag.Wikidata_URL))
    .map((tag) => normalizeName(tag.term));
  for (const { name, kind } of names) {
    const forms = [normalizeName(name), normalizeName(pluralize(name))];
    if (termsWithoutItem.some((term) => forms.includes(term))) return { name, kind };
  }
  return null;
}
