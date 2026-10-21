import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestSpacer, scheduleTurn } from "./requestSpacer.ts";

describe("createRequestSpacer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts concurrent callers one interval apart", async () => {
    vi.useFakeTimers({ now: 1000 });
    const waitForTurn = createRequestSpacer(30);
    const starts: number[] = [];
    const turns = Promise.all(
      [1, 2, 3].map(async () => {
        await waitForTurn();
        starts.push(Date.now());
      }),
    );
    await vi.runAllTimersAsync();
    await turns;
    expect(starts).toEqual([1000, 1030, 1060]);
  });
});

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
