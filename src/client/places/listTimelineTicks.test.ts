import { describe, expect, it } from "vitest";
import { listTimelineTicks } from "./listTimelineTicks";

const labelsOf = (domain: { start: number; end: number }) =>
  listTimelineTicks(domain).map(({ label }) => label);

describe("listTimelineTicks", () => {
  describe("when the timeline spans decades", () => {
    it("marks every ten years", () => {
      expect(labelsOf({ start: 1968, end: 2003 })).toEqual(["1970", "1980", "1990", "2000"]);
    });
  });

  describe("when the timeline spans a few years", () => {
    it("marks every year", () => {
      expect(labelsOf({ start: 1989.8, end: 1993.2 })).toEqual(["1990", "1991", "1992", "1993"]);
    });
  });

  describe("when the timeline spans about a year", () => {
    it("marks every three months, naming the year at its start", () => {
      expect(labelsOf({ start: 1990.7, end: 1991.7 })).toEqual(["Oct", "1991", "Apr", "Jul"]);
    });

    it("places each month at its start as a decimal year", () => {
      expect(listTimelineTicks({ start: 1990.7, end: 1991.7 })[2]?.year).toBeCloseTo(1991.25);
    });
  });

  describe("when the timeline reaches before the common era", () => {
    it("names years before the common era as BCE", () => {
      expect(labelsOf({ start: -1100, end: 100 })).toEqual(["1001 BCE", "501 BCE", "1 BCE"]);
    });
  });
});
