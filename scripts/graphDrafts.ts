import type {
  ConnectionBasis,
  ConnectionKind,
  ConnectionSource,
  NodeKind,
  NodeName,
} from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";

/** A node that an import adds to the graph. */
export type NodeDraft = {
  /** A Wikidata identifier such as "wikidata:Q1044186" where one exists, otherwise the source's own. */
  id: string;
  kind: NodeKind;
  label: string;
  names: NodeName[];
  /** A link to an image or recording of the node, under the media's own licence. */
  media?: NodeMedia;
};

/** A link to an image or recording, with what its licence asks of those who show it. */
export type NodeMedia = {
  url: string;
  licence: string;
  /** The author or holder to credit, when the licence asks for credit. */
  credit?: string | null;
  /** The page that describes the media and its licence. */
  pageUrl?: string | null;
};

/** A connection that an import adds to the graph, with the studies that support it. */
export type ConnectionDraft = {
  sourceNodeId: string;
  targetNodeId: string;
  kind: ConnectionKind;
  /** The specific relation, for example "pollinates" or "contains compound". */
  relation: string;
  basis: ConnectionBasis;
  /** The taxonomic rank that the source supports the connection at, for example "genus". */
  taxonomicLevel: string | null;
  weight?: number | null;
  /** A human-readable name of the place where the connection was recorded. */
  place?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** An ISO 8601 date, or an interval such as "1990/1992". */
  date?: string | null;
  licence: string;
  qualityFlags: QualityFlag[];
  sources: ConnectionSource[];
};
