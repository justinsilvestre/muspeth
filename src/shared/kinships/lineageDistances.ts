/**
 * Measures, for each pair of organisms, the share of their taxonomic lineages that they do not have in common.
 * A lineage lists the taxa from the kingdom down to the organism's own taxon.
 */
export function lineageDistances(ids: string[], lineagesById: Map<string, string[]>) {
  const lineages = ids.map((id) => lineagesById.get(id) ?? []);
  return lineages.map((a, i) => lineages.map((b, j) => (i === j ? 0 : distanceBetween(a, b))));
}

function distanceBetween(a: string[], b: string[]) {
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;
  let shared = 0;
  while (shared < Math.min(a.length, b.length) && a[shared] === b[shared]) shared += 1;
  return 1 - shared / longest;
}
