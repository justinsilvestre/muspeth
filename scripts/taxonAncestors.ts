/** The ranks from subgenus up to family, which count as ancestors of an organism. */
export const ancestorRankQids = ["Q3238261", "Q34740", "Q227936", "Q164280", "Q35409"];

/** Ranks above family, where the search for ancestors stops. */
const higherRankQids = new Set([
  "Q2136103", // superfamily
  "Q36602", // order
  "Q37517", // class
  "Q38348", // phylum
  "Q36732", // kingdom
]);

/** The most steps up from an organism that are followed, since taxa without a rank add steps. */
const maxSteps = 12;

/**
 * Walks up from an organism through the parents that Wikidata gives, and lists the taxa on the
 * way whose rank is from subgenus to family. The walk ends at taxa of family rank and above.
 */
export function collectAncestors(
  organismQid: string,
  parentQidsOf: Map<string, string[]>,
  rankQidOf: Map<string, string>,
) {
  const ancestors = new Set<string>();
  let frontier = [organismQid];
  for (let step = 0; step < maxSteps && frontier.length > 0; step++) {
    const parents = frontier.flatMap((qid) => parentQidsOf.get(qid) ?? []);
    for (const parent of parents) {
      if (ancestorRankQids.includes(rankQidOf.get(parent) ?? "")) ancestors.add(parent);
    }
    frontier = parents.filter((parent) => !isFamilyOrHigher(rankQidOf.get(parent)));
  }
  return [...ancestors];
}

/** Tells whether a rank is family or above, where the search for ancestors stops. */
export function isFamilyOrHigher(rankQid: string | undefined) {
  return rankQid === "Q35409" || higherRankQids.has(rankQid ?? "");
}
