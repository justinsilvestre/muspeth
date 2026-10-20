import type { TraitRecord } from "./traitRecord.ts";

/** How many nearest neighbours to keep from all records, from other groups, and from the graph. */
const neighbourCounts = { overall: 3, otherGroup: 1, inGraph: 1 };

type Candidate<Traits> = {
  record: TraitRecord<Traits>;
  similarity: number;
  isInGraph: boolean;
  tieBreaker: number;
};

/** A record near another in trait space. */
export type TraitNeighbour<Traits> = {
  record: TraitRecord<Traits>;
  similarity: number;
  /** Whether a record left out is exactly as near, so that a fixed rule chose between them. */
  isTied: boolean;
};

/**
 * Picks the records nearest to the subject in trait space: the nearest few overall, the nearest of
 * another group, and the nearest already in the graph. Records with nothing in common are left out.
 * Among equally near records, those in the graph come first, then a stable hash of the two names
 * decides, so that no record is favoured for its place in the alphabet.
 */
export function selectTraitNeighbours<Traits>(
  subject: TraitRecord<Traits>,
  records: TraitRecord<Traits>[],
  compare: (first: Traits, second: Traits) => number,
  isInGraph: (name: string) => boolean,
) {
  const candidates = records
    .filter((record) => record.name !== subject.name)
    .map((record) => ({
      record,
      similarity: roundAwayNoise(compare(subject.traits, record.traits)),
      isInGraph: isInGraph(record.name),
      tieBreaker: hashNames(subject.name, record.name),
    }))
    .filter(({ similarity }) => similarity > 0)
    .sort(compareNearness);
  const picks = [
    ...takeNearest(candidates, neighbourCounts.overall),
    ...takeNearest(
      candidates.filter(({ record }) => record.group !== subject.group),
      neighbourCounts.otherGroup,
    ),
    ...takeNearest(
      candidates.filter((candidate) => candidate.isInGraph),
      neighbourCounts.inGraph,
    ),
  ];
  const pickedNames = new Set<string>();
  return picks.filter(
    ({ record }) => !pickedNames.has(record.name) && pickedNames.add(record.name),
  );
}

function compareNearness<Traits>(first: Candidate<Traits>, second: Candidate<Traits>) {
  return (
    second.similarity - first.similarity ||
    Number(second.isInGraph) - Number(first.isInGraph) ||
    first.tieBreaker - second.tieBreaker
  );
}

function takeNearest<Traits>(sortedCandidates: Candidate<Traits>[], count: number) {
  const firstLeftOut = sortedCandidates[count];
  return sortedCandidates.slice(0, count).map(({ record, similarity }) => ({
    record,
    similarity,
    isTied: similarity === firstLeftOut?.similarity,
  })) satisfies TraitNeighbour<Traits>[];
}

/** Rounds away floating-point noise, so that equally near records compare as equal. */
function roundAwayNoise(similarity: number) {
  return Math.round(similarity * 1e9) / 1e9;
}

/** Hashes two names with 32-bit FNV-1a. */
function hashNames(first: string, second: string) {
  let hash = 0x811c9dc5;
  for (const character of `${first}\n${second}`) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), 0x01000193) >>> 0;
  }
  return hash;
}
