/**
 * Measures how far two groupings of the same organisms agree, as the correlation between the distances
 * they give each pair: 1 when they rank every pair alike, 0 when unrelated, -1 when opposed.
 * Returns null when either grouping puts every pair at the same distance, since nothing can then be compared.
 */
export function correlateDistances(a: number[][], b: number[][]) {
  const pairs = a.flatMap((row, i) =>
    row.slice(i + 1).map((value, k) => [value, b[i]?.[i + 1 + k] ?? 1]),
  );
  const [meanA, meanB] = [0, 1].map((side) => mean(pairs.map((pair) => pair[side] ?? 0)));
  let [covariance, varianceA, varianceB] = [0, 0, 0];
  for (const [x = 0, y = 0] of pairs) {
    covariance += (x - (meanA ?? 0)) * (y - (meanB ?? 0));
    varianceA += (x - (meanA ?? 0)) ** 2;
    varianceB += (y - (meanB ?? 0)) ** 2;
  }
  return varianceA && varianceB ? covariance / Math.sqrt(varianceA * varianceB) : null;
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
