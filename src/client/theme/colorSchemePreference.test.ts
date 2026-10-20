import { describe, expect, it } from "vitest";
import { resolveColorScheme } from "./colorSchemePreference";

describe("resolveColorScheme", () => {
  describe("when the preference follows the system", () => {
    it("is dark if the system prefers dark", () => {
      expect(resolveColorScheme("system", true)).toBe("dark");
    });

    it("is light if the system prefers light", () => {
      expect(resolveColorScheme("system", false)).toBe("light");
    });
  });

  it("keeps an explicit preference regardless of the system", () => {
    expect(resolveColorScheme("light", true)).toBe("light");
  });
});
