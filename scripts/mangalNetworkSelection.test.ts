import { describe, expect, it } from "vitest";
import { type NetworkSize, selectNetworks } from "./mangalNetworkSelection.ts";

const roomyLimits = { networkCount: 10, interactionCount: 1000, networksPerDataset: 10 };

function makeSize(id: number, interactionCount: number, datasetId = id) {
  return { id, datasetId, interactionCount } satisfies NetworkSize;
}

describe("selectNetworks", () => {
  it("takes the smallest networks first", () => {
    const candidates = [makeSize(1, 300), makeSize(2, 100), makeSize(3, 200)];
    const limits = { ...roomyLimits, networkCount: 2 };
    expect(selectNetworks(candidates, [], limits)).toEqual([2, 3]);
  });

  it("stops before the links in all exceed the limit", () => {
    const candidates = [makeSize(1, 600), makeSize(2, 500)];
    expect(selectNetworks(candidates, [], roomyLimits)).toEqual([2]);
  });

  it("takes at most the limit of networks from one dataset", () => {
    const candidates = [makeSize(1, 10, 7), makeSize(2, 20, 7), makeSize(3, 30, 8)];
    const limits = { ...roomyLimits, networksPerDataset: 1 };
    expect(selectNetworks(candidates, [], limits)).toEqual([1, 3]);
  });

  it("takes pinned networks first, whatever their size", () => {
    const candidates = [makeSize(1, 100), makeSize(2, 900)];
    expect(selectNetworks(candidates, [2], roomyLimits)).toEqual([2, 1]);
  });

  it("takes pinned networks beyond the limits", () => {
    const candidates = [makeSize(1, 2000)];
    expect(selectNetworks(candidates, [1], roomyLimits)).toEqual([1]);
  });
});
