import type { QualityFlag } from "./qualityFlags";

export const nodeKinds = [
  "organism",
  "compound",
  "cultural_object",
  "word",
  "story_motif",
  "recording",
  "place",
] as const;

export const connectionKinds = [
  "interaction",
  "likeness",
  "shared_substance",
  "shared_culture",
  "shared_words_and_stories",
  "shared_place_and_sound",
] as const;

/**
 * How a connection is known: reported by a study ("observed"), derived by us, for example from
 * trait similarity ("computed"), or a meaning or use assigned by people ("attributed").
 */
export const connectionBases = ["observed", "computed", "attributed"] as const;

export type NodeKind = (typeof nodeKinds)[number];
export type ConnectionKind = (typeof connectionKinds)[number];
export type ConnectionBasis = (typeof connectionBases)[number];

/** A name for a node in one language, as a BCP 47 language tag. */
export type NodeName = {
  language: string;
  name: string;
};

/** An image of a node, linked from where it is published, with what its licence asks to be shown. */
export type NodeMedia = {
  url: string;
  /** An SPDX identifier, such as "CC-BY-SA-4.0", or else the publisher's name for the licence. */
  licence: string;
  /** The author or holder to credit, when known. */
  credit: string | null;
  /** The page that describes the media and its licence, when known. */
  pageUrl: string | null;
};

export type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  names: NodeName[];
};

/** A study that supports a connection, with the dataset that published it. */
export type ConnectionSource = {
  /** The dataset's identifier at its source, for example "globalbioticinteractions/eppo". */
  datasetId: string | null;
  datasetCitation: string | null;
  studyCitation: string | null;
  /** A DOI resolver URL when the study has a DOI, otherwise the study's own address. */
  studyUrl: string | null;
  /** How many source records report the connection in this study, when they were counted. */
  recordCount: number | null;
};

export type Connection = {
  id: number;
  /** Whether the requested node is the source ("outgoing") or the target ("incoming") of the connection. */
  direction: "outgoing" | "incoming";
  neighborId: string;
  kind: ConnectionKind;
  relation: string;
  basis: ConnectionBasis;
  /** The taxonomic rank that the source supports the connection at, for example "genus". */
  taxonomicLevel: string | null;
  weight: number | null;
  /** A human-readable name of the place where the connection was recorded. */
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  /** An ISO 8601 date, or an interval such as "1990/1992". */
  date: string | null;
  source: string;
  licence: string;
  qualityFlags: QualityFlag[];
  sources: ConnectionSource[];
};
