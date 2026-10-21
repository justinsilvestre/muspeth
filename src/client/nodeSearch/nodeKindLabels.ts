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
