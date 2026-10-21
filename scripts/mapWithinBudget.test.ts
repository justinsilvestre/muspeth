import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mapWithinBudget } from "./mapWithinBudget.ts";

function waitTenMilliseconds(item: number) {
  return new Promise<number>((resolve) => setTimeout(() => resolve(item), 10));
}

describe("mapWithinBudget", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function mapFiveItems(budgetMilliseconds: number) {
    const mapped = mapWithinBudget([1, 2, 3, 4, 5], waitTenMilliseconds, budgetMilliseconds, 1);
    await vi.advanceTimersByTimeAsync(100);
    return mapped;
  }

  it("maps every item when the budget suffices", async () => {
    const { results } = await mapFiveItems(1_000);
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it("starts no item once the budget has run out", async () => {
    const { results } = await mapFiveItems(25);
    expect(results).toEqual([1, 2, 3]);
  });

  it("counts the items it skipped", async () => {
    const { skippedCount } = await mapFiveItems(25);
    expect(skippedCount).toBe(2);
  });

  it("tells each call whether time is left", async () => {
    const mapped = mapWithinBudget(
      [1],
      async (_item, hasTimeLeft) => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return hasTimeLeft();
      },
      25,
      1,
    );
    await vi.advanceTimersByTimeAsync(100);
    expect((await mapped).results).toEqual([false]);
  });

  it("keeps the results in the order of the items", async () => {
    const mapped = mapWithinBudget(
      [30, 1, 10],
      (delay) => new Promise<number>((resolve) => setTimeout(() => resolve(delay), delay)),
      1_000,
      3,
    );
    await vi.advanceTimersByTimeAsync(100);
    expect((await mapped).results).toEqual([30, 1, 10]);
  });
});
