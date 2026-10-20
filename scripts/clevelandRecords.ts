import { type Artwork, toYearInterval } from "./artworkDrafts.ts";
import { mentionsName, type SearchName } from "./museumNames.ts";

/** The fields of a Cleveland Museum of Art open access record that the import reads. */
export type ClevelandRecord = {
  id: number;
  accession_number: string;
  title: string;
  url: string;
  share_license_status: string;
  creation_date: string | null;
  creation_date_earliest: number | null;
  creation_date_latest: number | null;
  images: { web?: { url: string } } | null;
  creators: { description: string }[] | null;
};

/** The fields to request, since a full record is long. */
export const clevelandFields = [
  "id",
  "accession_number",
  "title",
  "url",
  "share_license_status",
  "creation_date",
  "creation_date_earliest",
  "creation_date_latest",
  "images",
  "creators",
];

/** Cleveland shares the pictures of its CC0 records under CC0. */
const imageLicence = "CC0-1.0";

/** Converts a CC0 record with a picture into an artwork, or nothing for any other record. */
export function toClevelandArtwork(record: ClevelandRecord) {
  const imageUrl = record.images?.web?.url;
  if (record.share_license_status !== "CC0" || !imageUrl) return null;
  return {
    id: `cleveland:${record.id}`,
    title: record.title,
    url: record.url,
    imageUrl,
    imageLicence,
    date: toYearInterval(record.creation_date_earliest, record.creation_date_latest),
    citation: toCitation(record),
  } satisfies Artwork;
}

function toCitation(record: ClevelandRecord) {
  const artist = record.creators?.[0]?.description;
  const parts = [record.title, artist, record.creation_date].filter(Boolean);
  return `${parts.join(", ")}. The Cleveland Museum of Art, ${record.accession_number}.`;
}

/** Finds the first of the names that the record's title mentions, preferring earlier names. */
export function matchClevelandTitle({ title }: ClevelandRecord, names: SearchName[]) {
  return names.find(({ name }) => mentionsName(title, name)) ?? null;
}
