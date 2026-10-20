import { describe, expect, it } from "vitest";
import { sourceDisplayName } from "./sourceDisplayName";

describe("sourceDisplayName", () => {
  it("names a known source in full", () => {
    expect(sourceDisplayName("globi")).toBe("Global Biotic Interactions (GloBI)");
  });

  it("falls back to the stored identifier for an unknown source", () => {
    expect(sourceDisplayName("unknown")).toBe("unknown");
  });
});
