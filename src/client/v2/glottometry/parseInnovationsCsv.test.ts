import { describe, expect, it } from "vitest";
import { parseInnovationsCsv } from "./parseInnovationsCsv";

const csv = ",A,B,C\rfirst,1,1,0\rsecond,1,NA,1\r";

describe("parseInnovationsCsv", () => {
  it("reads the language names from the header", () => {
    expect(parseInnovationsCsv(csv).languages).toEqual(["A", "B", "C"]);
  });

  it("collects the languages marked 1 as members of an innovation", () => {
    expect(parseInnovationsCsv(csv).innovations[0]?.members).toEqual(new Set(["A", "B"]));
  });

  it("treats NA as not a member", () => {
    expect(parseInnovationsCsv(csv).innovations[1]?.members).toEqual(new Set(["A", "C"]));
  });

  it("keeps the innovation label", () => {
    expect(parseInnovationsCsv(csv).innovations[1]?.label).toBe("second");
  });
});
