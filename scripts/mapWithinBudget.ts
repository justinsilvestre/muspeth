/**
 * Maps items with at most `concurrency` calls running at once, but starts no call once
 * `budgetMilliseconds` have passed. Each call is handed a check of whether time is left, so that
 * a long call can stop early too. Calls already running are awaited.
 * Returns the results of the items that were mapped, in the order of the items,
 * and how many items were skipped.
 */
export async function mapWithinBudget<Item, Result>(
  items: Item[],
  map: (item: Item, hasTimeLeft: () => boolean) => Promise<Result>,
  budgetMilliseconds: number,
  concurrency = 8,
) {
  const deadline = Date.now() + budgetMilliseconds;
  const hasTimeLeft = () => Date.now() < deadline;
  const results: Result[] = [];
  let next = 0;
  async function work() {
    while (next < items.length && hasTimeLeft()) {
      const index = next++;
      results[index] = await map(items[index] as Item, hasTimeLeft);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, work));
  return { results: results.slice(0, next), skippedCount: items.length - next };
}
