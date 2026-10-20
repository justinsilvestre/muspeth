import { describe, expect, it } from "vitest";
import { createRequestSpacer } from "./requestSpacer.ts";

describe("createRequestSpacer", () => {
  it("makes concurrent callers start at least one interval apart", async () => {
    const waitForTurn = createRequestSpacer(30);
    const starts: number[] = [];
    await Promise.all(
      [1, 2, 3].map(async () => {
        await waitForTurn();
        starts.push(Date.now());
      }),
    );
    const gaps = starts.slice(1).map((start, index) => start - (starts[index] ?? 0));
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(25);
  });
});
