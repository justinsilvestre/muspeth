import { describe, expect, it } from "vitest";
import { truncateLabel } from "./truncateLabel";

describe("truncateLabel", () => {
  it("keeps a label that fits", () => {
    expect(truncateLabel("pine", 10)).toBe("pine");
  });

  it("ends a cut label with an ellipsis, within the length", () => {
    expect(truncateLabel("Japanese red pine", 10)).toBe("Japanese…");
  });
});
