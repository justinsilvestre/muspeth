/** Counts the pairs of organisms that share something, which a distance below 1 marks. */
export function countRelatedPairs(distances: number[][]) {
  return distances.reduce(
    (count, row, i) => count + row.slice(i + 1).filter((distance) => distance < 1).length,
    0,
  );
}
