/** A name for a node in one language, as a BCP 47 language tag. */
export type NodeName = {
  language: string;
  name: string;
};

export type GraphNode = {
  id: string;
  kind: string;
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
  kind: string;
  relation: string;
  basis: string;
  source: string;
  licence: string;
  qualityFlags: string[];
  sources: ConnectionSource[];
};
