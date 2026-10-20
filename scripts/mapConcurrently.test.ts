import { describe, expect, it } from "vitest";
import { mapConcurrently } from "./mapConcurrently.ts";

describe("mapConcurrently", () => {
  it("keeps the results in the order of the items", async () => {
    const results = await mapConcurrently(
      [30, 1, 10],
      async (n) => {
        await new Promise((resolve) => setTimeout(resolve, n));
        return n;
      },
      3,
    );
    expect(results).toEqual([30, 1, 10]);
  });

  it("never runs more calls at once than allowed", async () => {
    let running = 0;
    let most = 0;
    await mapConcurrently(
      [1, 2, 3, 4, 5, 6],
      async () => {
        running++;
        most = Math.max(most, running);
        await new Promise((resolve) => setTimeout(resolve, 1));
        running--;
      },
      2,
    );
    expect(most).toBe(2);
  });
});
