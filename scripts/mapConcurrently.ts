/** Maps items through an asynchronous function, running at most `concurrency` calls at once. */
export async function mapConcurrently<Item, Result>(
  items: Item[],
  concurrency: number,
  map: (item: Item) => Promise<Result>,
) {
  const results: Result[] = [];
  for (let start = 0; start < items.length; start += concurrency) {
    results.push(...(await Promise.all(items.slice(start, start + concurrency).map(map))));
  }
  return results;
}
