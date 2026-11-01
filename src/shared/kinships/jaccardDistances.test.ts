import { describe, expect, it } from "vitest";
import { jaccardDistances } from "./jaccardDistances";

describe("jaccardDistances", () => {
  it("measures how few neighbours two organisms share", () => {
    const neighbours = new Map([
      ["pine", new Set(["pinene", "limonene"])],
      ["spruce", new Set(["pinene", "camphor"])],
    ]);
    expect(jaccardDistances(["pine", "spruce"], neighbours)[0]?.[1]).toBeCloseTo(1 - 1 / 3);
  });

  it("puts organisms with the same neighbours at no distance", () => {
    const neighbours = new Map([
      ["pine", new Set(["pinene"])],
      ["spruce", new Set(["pinene"])],
    ]);
    expect(jaccardDistances(["pine", "spruce"], neighbours)[0]?.[1]).toBe(0);
  });

  it("counts a direct link as a shared neighbour", () => {
    const neighbours = new Map([
      ["bee", new Set(["clover"])],
      ["clover", new Set(["bee"])],
    ]);
    expect(jaccardDistances(["bee", "clover"], neighbours)[0]?.[1]).toBe(0);
  });

  it("puts an organism without neighbours as far as possible from the others", () => {
    const neighbours = new Map([
      ["pine", new Set(["pinene"])],
      ["moss", new Set<string>()],
    ]);
    expect(jaccardDistances(["pine", "moss"], neighbours)[0]?.[1]).toBe(1);
  });

  it("puts each organism at no distance from itself", () => {
    const neighbours = new Map([["moss", new Set<string>()]]);
    expect(jaccardDistances(["moss"], neighbours)).toEqual([[0]]);
  });
});
