import { describe, expect, it } from "vitest";
import { chunk, fetchInBatches } from "./fetchInBatches.ts";

describe("chunk", () => {
  it("splits items into groups of at most the given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("fetchInBatches", () => {
  it("joins the results of each group in order", async () => {
    const results = await fetchInBatches([1, 2, 3], 2, async (batch) => batch.map((n) => n * 10));
    expect(results).toEqual([10, 20, 30]);
  });

  describe("when a group of more than one item fails", () => {
    const failsOnLargeBatches = async (batch: number[]) => {
      if (batch.length > 1) throw new Error("too large");
      return batch;
    };

    it("retries it in smaller groups", async () => {
      expect(await fetchInBatches([1, 2, 3], 3, failsOnLargeBatches)).toEqual([1, 2, 3]);
    });
  });

  describe("when a single item fails", () => {
    it("throws the error", async () => {
      const fails = async (): Promise<number[]> => {
        throw new Error("broken");
      };
      await expect(fetchInBatches([1], 1, fails)).rejects.toThrow("broken");
    });
  });
});
