import { describe, expect, it } from "vitest";
import { parseDateSpan } from "./parseDateSpan";

describe("parseDateSpan", () => {
  it("spans a whole year", () => {
    expect(parseDateSpan("1990")).toEqual({ start: 1990, end: 1991 });
  });

  it("starts a month part of the way through its year", () => {
    expect(parseDateSpan("1990-07")?.start).toBe(1990.5);
  });

  it("spans a month", () => {
    const span = parseDateSpan("1990-07");
    expect((span?.end ?? 0) - (span?.start ?? 0)).toBeCloseTo(1 / 12);
  });

  it("spans a day", () => {
    const span = parseDateSpan("2001-04-01");
    expect((span?.end ?? 0) - (span?.start ?? 0)).toBeCloseTo(1 / 365.25);
  });

  it("spans an interval from the start of its first date to the end of its last", () => {
    expect(parseDateSpan("1990/1992")).toEqual({ start: 1990, end: 1993 });
  });

  it("reads a year before the common era", () => {
    expect(parseDateSpan("-0500")).toEqual({ start: -500, end: -499 });
  });

  it("gives nothing for text that is not a date", () => {
    expect(parseDateSpan("spring")).toBeNull();
  });
});
