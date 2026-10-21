import type { NodeKind } from "../../shared/graph";

/** Names each kind of node in words a reader would use. */
export const nodeKindLabels = {
  organism: "organism",
  compound: "compound",
  cultural_object: "artwork",
  word: "word",
  story_motif: "story motif",
  recording: "recording",
  place: "place",
} as const satisfies Record<NodeKind, string>;

/** Names a group of nodes of each kind, starting with a capital letter. */
export const nodeKindPluralLabels = {
  organism: "Organisms",
  compound: "Compounds",
  cultural_object: "Artworks",
  word: "Words",
  story_motif: "Story motifs",
  recording: "Recordings",
  place: "Places",
} as const satisfies Record<NodeKind, string>;
