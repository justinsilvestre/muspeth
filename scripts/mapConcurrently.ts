/** Maps items with at most `concurrency` calls running at once, keeping the results in order. */
export async function mapConcurrently<Item, Result>(
  items: Item[],
  map: (item: Item) => Promise<Result>,
  concurrency = 8,
) {
  const results: Result[] = new Array(items.length);
  let next = 0;
  async function work() {
    while (next < items.length) {
      const index = next++;
      results[index] = await map(items[index] as Item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, work));
  return results;
}
