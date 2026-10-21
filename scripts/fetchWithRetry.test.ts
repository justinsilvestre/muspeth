import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry } from "./fetchWithRetry.ts";

function stubResponses(...statuses: number[]) {
  const fetchStub = vi.fn();
  for (const status of statuses) {
    fetchStub.mockResolvedValueOnce(
      new Response(null, { status, headers: { "retry-after": "1" } }),
    );
  }
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchWithRetry", () => {
  describe("when the server is unavailable once", () => {
    it("returns the response of the next attempt", async () => {
      stubResponses(503, 200);
      const pending = fetchWithRetry("https://example.test");
      await vi.runAllTimersAsync();
      expect((await pending).status).toBe(200);
    });
  });

  describe("when the server stays unavailable", () => {
    it("gives up after four attempts", async () => {
      const fetchStub = stubResponses(503, 503, 503, 503, 503);
      const pending = fetchWithRetry("https://example.test");
      await vi.runAllTimersAsync();
      await pending;
      expect(fetchStub).toHaveBeenCalledTimes(4);
    });
  });

  describe("when the request is bad", () => {
    it("does not retry", async () => {
      const fetchStub = stubResponses(400, 200);
      await fetchWithRetry("https://example.test");
      expect(fetchStub).toHaveBeenCalledTimes(1);
    });
  });
});
