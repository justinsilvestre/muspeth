import type { ConnectionKind } from "../graph";

/** The ways of grouping organisms that the kinships view compares: by descent, or by each kind of connection. */
export const kinshipGroupings = [
  "descent",
  "interaction",
  "likeness",
  "shared_substance",
  "shared_culture",
  "shared_words_and_stories",
  "shared_place_and_sound",
] as const satisfies ("descent" | ConnectionKind)[];

export type KinshipGrouping = (typeof kinshipGroupings)[number];

/** A set of organisms with the distance between each pair under each grouping, from 0 (alike) to 1 (nothing shared). */
export type Kinships = {
  organisms: { id: string; label: string; kingdom: string | null; className: string | null }[];
  /** For each grouping, a square table of distances in the order of `organisms`. */
  distances: Record<KinshipGrouping, number[][]>;
};
