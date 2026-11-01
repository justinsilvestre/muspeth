import { describe, expect, it } from "vitest";
import { abbreviateSpecies } from "./abbreviateSpecies";

describe("abbreviateSpecies", () => {
  it("shortens the genus to its initial", () => {
    expect(abbreviateSpecies("Apis mellifera")).toBe("A. mellifera");
  });

  it("keeps the genus of a placeholder species", () => {
    expect(abbreviateSpecies("Halictus sp.")).toBe("Halictus sp.");
  });

  it("keeps a numbered placeholder", () => {
    expect(abbreviateSpecies("Heteropterys sp1")).toBe("Heteropterys sp1");
  });

  it("drops words after the epithet", () => {
    expect(abbreviateSpecies("Cardamine angustata angustata")).toBe("C. angustata");
  });

  it("leaves a single word as it is", () => {
    expect(abbreviateSpecies("Syrphidae")).toBe("Syrphidae");
  });
});
