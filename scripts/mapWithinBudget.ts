/**
 * Maps items with at most `concurrency` calls running at once, but starts no call once
 * `budgetMilliseconds` have passed. Calls already running are awaited.
 * Returns the results of the items that were mapped, in the order of the items,
 * and how many items were skipped.
 */
export async function mapWithinBudget<Item, Result>(
  items: Item[],
  map: (item: Item) => Promise<Result>,
  budgetMilliseconds: number,
  concurrency = 8,
) {
  const deadline = Date.now() + budgetMilliseconds;
  const results: Result[] = [];
  let next = 0;
  async function work() {
    while (next < items.length && Date.now() < deadline) {
      const index = next++;
      results[index] = await map(items[index] as Item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, work));
  return { results: results.slice(0, next), skippedCount: items.length - next };
}
