import { describe, expect, it } from "vitest";
import { listChosenSources } from "./importSourceChoice.ts";

describe("listChosenSources", () => {
  it("gives the default sources without --only", () => {
    expect(listChosenSources(["--remote"], ["a", "b"])).toEqual(["a", "b"]);
  });

  it("gives the sources listed with --only, even ones left out by default", () => {
    expect(listChosenSources(["--only=b,c"], ["a", "b"])).toEqual(["b", "c"]);
  });
});
