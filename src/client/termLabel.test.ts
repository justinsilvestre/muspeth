import { describe, expect, it } from "vitest";
import { termLabel } from "./termLabel";

describe("termLabel", () => {
  it("separates the words of a term with spaces", () => {
    expect(termLabel("shared_words_and_stories")).toBe("shared words and stories");
  });
});
