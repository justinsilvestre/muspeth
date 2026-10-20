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

export type Connection = {
  id: number;
  /** Whether the requested node is the source ("outgoing") or the target ("incoming") of the connection. */
  direction: "outgoing" | "incoming";
  neighborId: string;
  kind: string;
  relation: string;
  basis: string;
  source: string;
  citation: string | null;
  licence: string;
  qualityFlags: string[];
};
