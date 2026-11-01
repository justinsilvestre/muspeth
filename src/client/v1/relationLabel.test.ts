import { describe, expect, it } from "vitest";
import { relationLabel } from "./relationLabel";

describe("relationLabel", () => {
  it("separates the words of a camel-case relation in lower case", () => {
    expect(relationLabel("hasEctomycorrhizalHost")).toBe("has ectomycorrhizal host");
  });

  it("leaves a relation that already has spaces unchanged", () => {
    expect(relationLabel("contains compound")).toBe("contains compound");
  });

  it("leaves a single-word relation unchanged", () => {
    expect(relationLabel("eats")).toBe("eats");
  });
});
