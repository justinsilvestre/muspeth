import { describe, expect, it } from "vitest";
import {
  type ConnectionFilter,
  emptyConnectionFilter,
  matchesConnectionFilter,
  parseConnectionFilter,
  writeConnectionFilter,
} from "./connectionFilter";
import type { GraphEdge } from "./graphExport";

const flaggedInteraction = {
  id: 1,
  sourceNodeId: "a",
  targetNodeId: "b",
  kind: "interaction",
  relation: "eats",
  basis: "observed",
  source: "globi",
  licence: "CC0-1.0",
  qualityFlags: ["unmatched_name"],
} satisfies GraphEdge;

function filterWith(fields: Partial<ConnectionFilter>) {
  return { ...emptyConnectionFilter, ...fields } satisfies ConnectionFilter;
}

function matches(fields: Partial<ConnectionFilter>) {
  return matchesConnectionFilter(flaggedInteraction, filterWith(fields));
}

describe("parseConnectionFilter", () => {
  it("reads no limits from empty parameters", () => {
    expect(parseConnectionFilter(new URLSearchParams())).toEqual({
      ok: true,
      value: emptyConnectionFilter,
    });
  });

  it("reads every value of a repeated parameter", () => {
    const result = parseConnectionFilter(new URLSearchParams("kind=interaction&kind=likeness"));
    expect(result.ok && result.value.kinds).toEqual(["interaction", "likeness"]);
  });

  it("reads bases, sources and flags", () => {
    const params = new URLSearchParams(
      "basis=computed&source=globi&flaggedWith=unmatched_name&notFlaggedWith=suspected_error",
    );
    expect(parseConnectionFilter(params)).toEqual({
      ok: true,
      value: {
        kinds: [],
        bases: ["computed"],
        sources: ["globi"],
        flaggedWith: ["unmatched_name"],
        notFlaggedWith: ["suspected_error"],
      },
    });
  });

  it("rejects an unknown kind", () => {
    expect(parseConnectionFilter(new URLSearchParams("kind=friendship")).ok).toBe(false);
  });

  it("rejects an unknown basis", () => {
    expect(parseConnectionFilter(new URLSearchParams("basis=guessed")).ok).toBe(false);
  });

  it("rejects an unknown quality flag", () => {
    expect(parseConnectionFilter(new URLSearchParams("notFlaggedWith=odd")).ok).toBe(false);
  });

  it("rejects an empty source", () => {
    expect(parseConnectionFilter(new URLSearchParams("source=")).ok).toBe(false);
  });

  it("says which value it could not read", () => {
    const result = parseConnectionFilter(new URLSearchParams("kind=friendship"));
    expect(!result.ok && result.error).toMatch(/^Unknown kind "friendship"/);
  });
});

describe("writeConnectionFilter", () => {
  it("writes each value as its own parameter", () => {
    const filter = filterWith({ bases: ["observed", "computed"] });
    const params = writeConnectionFilter(new URLSearchParams(), filter);
    expect(params.toString()).toBe("basis=observed&basis=computed");
  });

  it("keeps parameters that are not part of the filter", () => {
    const params = writeConnectionFilter(new URLSearchParams("from=a"), emptyConnectionFilter);
    expect(params.toString()).toBe("from=a");
  });

  it("replaces the filter already in the parameters", () => {
    const filter = filterWith({ kinds: ["interaction"] });
    const params = writeConnectionFilter(new URLSearchParams("kind=likeness"), filter);
    expect(params.getAll("kind")).toEqual(["interaction"]);
  });

  it("writes what parseConnectionFilter reads", () => {
    const filter = {
      kinds: ["likeness"],
      bases: ["attributed"],
      sources: ["mangal"],
      flaggedWith: ["sampling_bias"],
      notFlaggedWith: ["suspected_error"],
    } satisfies ConnectionFilter;
    const result = parseConnectionFilter(writeConnectionFilter(new URLSearchParams(), filter));
    expect(result).toEqual({ ok: true, value: filter });
  });
});

describe("matchesConnectionFilter", () => {
  it("keeps every connection when the filter is empty", () => {
    expect(matches({})).toBe(true);
  });

  it("keeps a connection of one of the given kinds", () => {
    expect(matches({ kinds: ["likeness", "interaction"] })).toBe(true);
  });

  it("leaves out a connection of another kind", () => {
    expect(matches({ kinds: ["likeness"] })).toBe(false);
  });

  it("leaves out a connection on another basis", () => {
    expect(matches({ bases: ["computed"] })).toBe(false);
  });

  it("leaves out a connection from another source", () => {
    expect(matches({ sources: ["mangal"] })).toBe(false);
  });

  it("keeps a connection that carries one of the required flags", () => {
    expect(matches({ flaggedWith: ["suspected_error", "unmatched_name"] })).toBe(true);
  });

  it("leaves out a connection that carries none of the required flags", () => {
    expect(matches({ flaggedWith: ["suspected_error"] })).toBe(false);
  });

  it("leaves out a connection that carries an excluded flag", () => {
    expect(matches({ notFlaggedWith: ["unmatched_name"] })).toBe(false);
  });
});
