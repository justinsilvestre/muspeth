/** Maps items through an asynchronous function, a few at a time, keeping their order. */
export async function mapConcurrently<Item, Result>(
  items: Item[],
  map: (item: Item) => Promise<Result>,
  concurrency = 8,
) {
  const results: Result[] = [];
  for (let start = 0; start < items.length; start += concurrency) {
    results.push(...(await Promise.all(items.slice(start, start + concurrency).map(map))));
  }
  return results;
}
