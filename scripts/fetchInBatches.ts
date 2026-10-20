/** Splits items into consecutive groups of at most `size`. */
export function chunk<Item>(items: Item[], size: number) {
  const groups: Item[][] = [];
  for (let start = 0; start < items.length; start += size) {
    groups.push(items.slice(start, start + size));
  }
  return groups;
}

/**
 * Fetches results for items in groups of at most `size`, one group at a time.
 * A group whose request fails is split in half and retried, down to a single item, so that
 * one request too large for the server to answer in time does not stop the whole run.
 */
export async function fetchInBatches<Item, Result>(
  items: Item[],
  size: number,
  fetchBatch: (batch: Item[]) => Promise<Result[]>,
) {
  const results: Result[] = [];
  for (const batch of chunk(items, size)) {
    results.push(...(await fetchWithSplitting(batch, fetchBatch)));
  }
  return results;
}

async function fetchWithSplitting<Item, Result>(
  batch: Item[],
  fetchBatch: (batch: Item[]) => Promise<Result[]>,
): Promise<Result[]> {
  try {
    return await fetchBatch(batch);
  } catch (error) {
    if (batch.length === 1) throw error;
    const middle = Math.ceil(batch.length / 2);
    return [
      ...(await fetchWithSplitting(batch.slice(0, middle), fetchBatch)),
      ...(await fetchWithSplitting(batch.slice(middle), fetchBatch)),
    ];
  }
}
