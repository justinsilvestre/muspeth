import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type CacheMode, createCachedFetch } from "./cachedFetch.ts";

const url = "https://api.example.org/birds";

function createDirectory() {
  return mkdtempSync(path.join(tmpdir(), "cached-fetch-"));
}

function stubNetwork(status = 200, body = '{"name":"wren"}') {
  const network = vi.fn(
    async () => new Response(body, { status, headers: { "content-range": "0-0/7" } }),
  );
  vi.stubGlobal("fetch", network);
  return network;
}

/** Fetches `url` twice through a fresh cache, and returns the second response. */
async function fetchTwice(mode: CacheMode = "on", init?: RequestInit) {
  const cachedFetch = createCachedFetch(createDirectory(), mode);
  await cachedFetch(url, init);
  return cachedFetch(url, init);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createCachedFetch", () => {
  describe("when the cache is on", () => {
    it("asks the network once for a URL fetched twice", async () => {
      const network = stubNetwork();
      await fetchTwice();
      expect(network).toHaveBeenCalledTimes(1);
    });

    it("gives the stored body on a later fetch", async () => {
      stubNetwork();
      expect(await (await fetchTwice()).json()).toEqual({ name: "wren" });
    });

    it("gives the stored headers on a later fetch", async () => {
      stubNetwork();
      expect((await fetchTwice()).headers.get("content-range")).toBe("0-0/7");
    });

    it("keeps a missing page (404)", async () => {
      stubNetwork(404, "");
      expect((await fetchTwice()).status).toBe(404);
    });

    it("asks the network again after a server error", async () => {
      const network = stubNetwork(503, "");
      await fetchTwice();
      expect(network).toHaveBeenCalledTimes(2);
    });

    it("tells requests with different bodies apart", async () => {
      const network = stubNetwork();
      const cachedFetch = createCachedFetch(createDirectory(), "on");
      await cachedFetch(url, { method: "POST", body: "query=wren" });
      await cachedFetch(url, { method: "POST", body: "query=robin" });
      expect(network).toHaveBeenCalledTimes(2);
    });

    it("leaves no partly written files behind", async () => {
      stubNetwork();
      const directory = createDirectory();
      await (await createCachedFetch(directory, "on")(url)).text();
      expect(readdirSync(directory).filter((file) => file.includes(".partial"))).toEqual([]);
    });
  });

  describe("when the cache is refreshing", () => {
    it("asks the network every time", async () => {
      const network = stubNetwork();
      await fetchTwice("refresh");
      expect(network).toHaveBeenCalledTimes(2);
    });

    it("stores what it fetched for later runs", async () => {
      const network = stubNetwork();
      const directory = createDirectory();
      await createCachedFetch(directory, "refresh")(url);
      await createCachedFetch(directory, "on")(url);
      expect(network).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the cache is off", () => {
    it("stores nothing", async () => {
      stubNetwork();
      const directory = createDirectory();
      await createCachedFetch(directory, "off")(url);
      expect(readdirSync(directory)).toEqual([]);
    });
  });

  it("waits for its turn before asking the network", async () => {
    stubNetwork();
    const waitForTurn = vi.fn(async () => {});
    await createCachedFetch(createDirectory(), "on")(url, undefined, waitForTurn);
    expect(waitForTurn).toHaveBeenCalledTimes(1);
  });

  it("does not wait for its turn when the response is stored", async () => {
    stubNetwork();
    const waitForTurn = vi.fn(async () => {});
    const cachedFetch = createCachedFetch(createDirectory(), "on");
    await cachedFetch(url);
    await cachedFetch(url, undefined, waitForTurn);
    expect(waitForTurn).not.toHaveBeenCalled();
  });
});
