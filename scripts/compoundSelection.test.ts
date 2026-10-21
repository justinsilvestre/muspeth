import { describe, expect, it } from "vitest";
import { limitSharedCompounds } from "./compoundSelection.ts";

const pair = (organismQid: string, compoundQid: string) => ({ organismQid, compoundQid });

describe("limitSharedCompounds", () => {
  it("keeps every pair within the limit", () => {
    const pairs = [pair("Q1", "Q10"), pair("Q2", "Q10")];
    expect(limitSharedCompounds(pairs, 5)).toEqual(pairs);
  });

  it("drops repeated pairs", () => {
    expect(limitSharedCompounds([pair("Q1", "Q10"), pair("Q1", "Q10")], 5)).toEqual([
      pair("Q1", "Q10"),
    ]);
  });

  it("keeps an organism's compounds found in the most organisms", () => {
    const pairs = [pair("Q1", "Q10"), pair("Q1", "Q11"), pair("Q2", "Q11"), pair("Q3", "Q11")];
    const kept = limitSharedCompounds(pairs, 1).filter(({ organismQid }) => organismQid === "Q1");
    expect(kept).toEqual([pair("Q1", "Q11")]);
  });

  it("breaks ties by the older item", () => {
    const pairs = [pair("Q1", "Q20"), pair("Q1", "Q3")];
    expect(limitSharedCompounds(pairs, 1)).toEqual([pair("Q1", "Q3")]);
  });
});
