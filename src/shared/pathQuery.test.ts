import { describe, expect, it } from "vitest";
import { parsePathQuery } from "./pathQuery";

function parse(query: string) {
  return parsePathQuery(new URLSearchParams(query));
}

describe("parsePathQuery", () => {
  it("reads the two ends of the path", () => {
    const result = parse("from=a&to=b");
    expect(result.ok && [result.value.fromId, result.value.toId]).toEqual(["a", "b"]);
  });

  it("asks for five paths of up to four steps by default", () => {
    const result = parse("from=a&to=b");
    expect(result.ok && [result.value.limit, result.value.maxSteps]).toEqual([5, 4]);
  });

  it("reads a limit and a number of steps", () => {
    const result = parse("from=a&to=b&limit=2&maxSteps=3");
    expect(result.ok && [result.value.limit, result.value.maxSteps]).toEqual([2, 3]);
  });

  it("reads a connection filter alongside", () => {
    const result = parse("from=a&to=b&basis=observed");
    expect(result.ok && result.value.filter.bases).toEqual(["observed"]);
  });

  it("rejects a query without a start", () => {
    expect(parse("to=b").ok).toBe(false);
  });

  it("rejects more than four steps", () => {
    expect(parse("from=a&to=b&maxSteps=5").ok).toBe(false);
  });

  it("rejects a limit that is not a number", () => {
    expect(parse("from=a&to=b&limit=many").ok).toBe(false);
  });

  it("rejects an invalid connection filter", () => {
    expect(parse("from=a&to=b&basis=guessed").ok).toBe(false);
  });
});
