/** A statement that a compound is found in an organism. */
export type OrganismCompound = { organismQid: string; compoundQid: string };

/**
 * Keeps at most `limit` compounds per organism from the pairs of compounds found in several
 * organisms. Compounds found in the most organisms come first, since they make the most paths.
 */
export function limitSharedCompounds(pairs: OrganismCompound[], limit: number) {
  const unique = [
    ...new Map(pairs.map((pair) => [`${pair.organismQid} ${pair.compoundQid}`, pair])).values(),
  ];
  const organismsPerCompound = Map.groupBy(unique, ({ compoundQid }) => compoundQid);
  const compoundsPerOrganism = Map.groupBy(unique, ({ organismQid }) => organismQid);
  return [...compoundsPerOrganism.values()].flatMap((organismPairs) =>
    organismPairs
      .toSorted(
        (a, b) =>
          (organismsPerCompound.get(b.compoundQid)?.length ?? 0) -
            (organismsPerCompound.get(a.compoundQid)?.length ?? 0) ||
          toItemNumber(a.compoundQid) - toItemNumber(b.compoundQid),
      )
      .slice(0, limit),
  );
}

function toItemNumber(qid: string) {
  return Number(qid.slice(1));
}
