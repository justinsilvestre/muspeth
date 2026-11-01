/** Lists up to `count` organisms closest to the given one, leaving out those at the greatest distance, which share nothing. */
export function listNearestKin(ids: string[], distances: number[][], id: string, count: number) {
  const row = distances[ids.indexOf(id)] ?? [];
  return ids
    .map((otherId, index) => ({ id: otherId, distance: row[index] ?? 1 }))
    .filter((kin) => kin.id !== id && kin.distance < 1)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}
