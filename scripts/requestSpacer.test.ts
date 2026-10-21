import { describe, expect, it } from "vitest";
import { scheduleTurn } from "./requestSpacer.ts";

describe("scheduleTurn", () => {
  describe("when the earliest next start has passed", () => {
    it("lets the caller start without waiting", () => {
      expect(scheduleTurn(1000, 900, 30).waitMilliseconds).toBe(0);
    });

    it("sets the next start one interval after now", () => {
      expect(scheduleTurn(1000, 900, 30).nextStart).toBe(1030);
    });
  });

  describe("when the earliest next start is still ahead", () => {
    it("makes the caller wait until the earliest next start", () => {
      expect(scheduleTurn(1000, 1020, 30).waitMilliseconds).toBe(20);
    });

    it("sets the next start one interval after the earliest next start", () => {
      expect(scheduleTurn(1000, 1020, 30).nextStart).toBe(1050);
    });
  });

  describe("when the earliest next start is now", () => {
    it("lets the caller start without waiting", () => {
      expect(scheduleTurn(1000, 1000, 30).waitMilliseconds).toBe(0);
    });
  });
});
