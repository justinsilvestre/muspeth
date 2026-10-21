import { describe, expect, it } from "vitest";
import { chooseTimelineDomain, packTimelineLanes } from "./layoutTimeline";

describe("chooseTimelineDomain", () => {
  it("starts before the earliest span", () => {
    const domain = chooseTimelineDomain([
      { start: 1990, end: 1993 },
      { start: 2005, end: 2006 },
    ]);
    expect(domain.start).toBeLessThan(1990);
  });

  it("ends after the latest span", () => {
    const domain = chooseTimelineDomain([
      { start: 1990, end: 1993 },
      { start: 2005, end: 2006 },
    ]);
    expect(domain.end).toBeGreaterThan(2006);
  });

  it("covers at least a year around a single day", () => {
    const { start, end } = chooseTimelineDomain([{ start: 2001.25, end: 2001.253 }]);
    expect(end - start).toBeGreaterThanOrEqual(1);
  });
});

describe("packTimelineLanes", () => {
  it("puts spans that do not overlap in the same lane", () => {
    const spans = [
      { start: 1990, end: 1991 },
      { start: 1995, end: 1996 },
    ];
    expect(packTimelineLanes(spans, 1)).toEqual([0, 0]);
  });

  it("puts overlapping spans in different lanes", () => {
    const spans = [
      { start: 1990, end: 1993 },
      { start: 1991, end: 1992 },
    ];
    expect(packTimelineLanes(spans, 1)).toEqual([0, 1]);
  });

  it("keeps spans closer than the gap apart", () => {
    const spans = [
      { start: 1990, end: 1991 },
      { start: 1991.5, end: 1992 },
    ];
    expect(packTimelineLanes(spans, 1)).toEqual([0, 1]);
  });
});
