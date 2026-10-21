import { describe, expect, it } from "vitest";
import { brushPeriod } from "./brushPeriod";

describe("brushPeriod", () => {
  it("rounds a stretch of several years out to whole years", () => {
    expect(brushPeriod(1990.4, 1993.2)).toEqual({ from: "1990", to: "1993" });
  });

  it("rounds a stretch shorter than two years out to whole months", () => {
    expect(brushPeriod(1990.05, 1990.3)).toEqual({ from: "1990-01", to: "1990-04" });
  });

  it("accepts a stretch brushed from right to left", () => {
    expect(brushPeriod(1993.2, 1990.4)).toEqual({ from: "1990", to: "1993" });
  });

  it("chooses the month around a single point", () => {
    expect(brushPeriod(2005.55, 2005.55)).toEqual({ from: "2005-07", to: "2005-07" });
  });

  it("writes years before the common era with a sign and four digits", () => {
    expect(brushPeriod(-500.5, -400.5)).toEqual({ from: "-0501", to: "-0401" });
  });

  it("leaves a stretch ending exactly at a new year in the year before", () => {
    expect(brushPeriod(1990, 1993)).toEqual({ from: "1990", to: "1992" });
  });
});
