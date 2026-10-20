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
  source: string;
  licence: string;
  qualityFlags: QualityFlag[];
  sources: ConnectionSource[];
};
