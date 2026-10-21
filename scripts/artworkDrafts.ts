import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";

/** The museum metadata that both museums publish under CC0. */
const metadataLicence = "CC0-1.0";

/** An artwork from a museum's open access collection, as it will be stored. */
export type Artwork = {
  /** The node identifier, such as "met:437133" or "cleveland:150693". */
  id: string;
  title: string;
  /** The artwork's page on the museum's website. */
  url: string;
  /** A link to a picture of the artwork. The picture stays on the museum's server. */
  imageUrl: string;
  /** The licence of the picture, which can differ from the licence of the record. */
  imageLicence: string;
  /** The author of the picture to credit, when its licence asks for credit. */
  imageCredit?: string | null;
  /** The page that describes the picture and its licence, when it differs from `url`. */
  imagePageUrl?: string | null;
  /** An ISO 8601 year or interval of years in which the artwork was made. */
  date: string | null;
  /** A citation of the artwork. */
  citation: string;
};

/** The dataset that credits an artwork's museum. */
export type Museum = { datasetId: string; datasetCitation: string };

/** Makes a node for an artwork, linking to its picture under the picture's own licence. */
export function toArtworkNode(artwork: Artwork) {
  return {
    id: artwork.id,
    kind: "cultural_object",
    label: artwork.title,
    names: [],
    media: {
      url: artwork.imageUrl,
      licence: artwork.imageLicence,
      credit: artwork.imageCredit ?? null,
      pageUrl: artwork.imagePageUrl ?? artwork.url,
    },
  } satisfies NodeDraft;
}

/** Makes a connection from an organism to an artwork that depicts it. */
export function toDepictedInConnection(
  organismId: string,
  artwork: Artwork,
  museum: Museum,
  qualityFlags: QualityFlag[],
) {
  return {
    sourceNodeId: organismId,
    targetNodeId: artwork.id,
    kind: "shared_culture",
    relation: "depicted in",
    basis: "attributed",
    taxonomicLevel: null,
    date: artwork.date,
    licence: metadataLicence,
    qualityFlags,
    sources: [
      {
        datasetId: museum.datasetId,
        datasetCitation: museum.datasetCitation,
        studyCitation: artwork.citation,
        studyUrl: artwork.url,
        recordCount: null,
      },
    ],
  } satisfies ConnectionDraft;
}

/** Writes a year, or an interval of years, in ISO 8601 form, or nothing when no year is known. */
export function toYearInterval(begin: number | null, end: number | null) {
  if (begin === null && end === null) return null;
  const first = begin ?? end ?? 0;
  const last = end ?? first;
  return first === last ? formatYear(first) : `${formatYear(first)}/${formatYear(last)}`;
}

function formatYear(year: number) {
  return `${year < 0 ? "-" : ""}${String(Math.abs(year)).padStart(4, "0")}`;
}
