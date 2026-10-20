import { describe, expect, it } from "vitest";
import type { ConnectionSource } from "../shared/graph";
import { groupSourcesByDataset } from "./groupSourcesByDataset";

function makeSource(overrides: Partial<ConnectionSource> = {}) {
  return {
    datasetId: "one",
    datasetCitation: "Dataset one.",
    studyCitation: "A study.",
    studyUrl: null,
    recordCount: 1,
    ...overrides,
  } satisfies ConnectionSource;
}

describe("groupSourcesByDataset", () => {
  it("gathers the studies of each dataset", () => {
    const sources = [makeSource(), makeSource({ studyCitation: "Another study." })];
    expect(groupSourcesByDataset(sources)).toEqual([
      { datasetId: "one", datasetCitation: "Dataset one.", studies: sources },
    ]);
  });

  it("puts the dataset with the most records first", () => {
    const sources = [makeSource(), makeSource({ datasetId: "two", recordCount: 5 })];
    expect(groupSourcesByDataset(sources).map(({ datasetId }) => datasetId)).toEqual([
      "two",
      "one",
    ]);
  });

  it("gathers studies without a dataset into a group of their own", () => {
    const withoutDataset = makeSource({ datasetId: null, datasetCitation: null });
    const sources = [makeSource(), withoutDataset, withoutDataset];
    const group = groupSourcesByDataset(sources).find(({ datasetId }) => datasetId === null);
    expect(group?.studies).toEqual([withoutDataset, withoutDataset]);
  });
});
