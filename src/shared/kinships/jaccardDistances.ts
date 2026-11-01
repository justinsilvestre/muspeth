/**
 * Measures, for each pair of organisms, the share of their neighbours that they do not have in common.
 * Two organisms linked to each other count each other as shared, so that a direct link brings them closer.
 * An organism without neighbours is as far as possible from every other.
 */
export function jaccardDistances(ids: string[], neighboursById: Map<string, Set<string>>) {
  const sets = ids.map((id) => neighboursById.get(id) ?? new Set<string>());
  return ids.map((a, i) =>
    ids.map((b, j) =>
      i === j ? 0 : distanceBetween(a, sets[i] ?? new Set(), b, sets[j] ?? new Set()),
    ),
  );
}

function distanceBetween(a: string, aNeighbours: Set<string>, b: string, bNeighbours: Set<string>) {
  if (!aNeighbours.size || !bNeighbours.size) return 1;
  const union = new Set([...aNeighbours, ...bNeighbours]);
  const isLinked = aNeighbours.has(b) && bNeighbours.has(a);
  const shared = [...aNeighbours].filter((n) => bNeighbours.has(n)).length + (isLinked ? 2 : 0);
  return 1 - shared / union.size;
}
