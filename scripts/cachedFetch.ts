import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";

/**
 * How imports use stored API responses: "on" reuses them, "refresh" fetches again and stores
 * the new responses, and "off" neither reads nor stores them.
 */
export type CacheMode = "on" | "refresh" | "off";

type StoredResponse = { url: string; status: number; headers: [string, string][] };
type CacheEntry = { metaPath: string; bodyPath: string };

const cacheModes = ["on", "refresh", "off"] satisfies CacheMode[];

/**
 * Fetches like `fetch`, storing successful responses and missing pages (404) in
 * `.cache/api` so that later imports can reuse them. The `API_CACHE` environment variable sets
 * the cache mode, and `rm -rf .cache/api` clears the cache.
 */
export const cachedFetch = createCachedFetch(
  path.resolve(import.meta.dirname, "../.cache/api"),
  readCacheMode(process.env.API_CACHE),
);

/**
 * Creates a fetch function that keeps responses in `directory`.
 * Its `waitForTurn` argument is called only before a request goes to the network.
 */
export function createCachedFetch(directory: string, mode: CacheMode) {
  return async (url: string | URL, init?: RequestInit, waitForTurn?: () => Promise<void>) => {
    const entry = locateEntry(directory, url, init);
    if (mode === "on" && existsSync(entry.metaPath)) return readStoredResponse(entry);
    await waitForTurn?.();
    const response = await fetch(url, init);
    if (mode === "off" || !isWorthStoring(response)) return response;
    mkdirSync(directory, { recursive: true });
    await storeResponse(entry, String(url), response);
    return readStoredResponse(entry);
  };
}

/** Reads the cache mode from the value of `API_CACHE`, which defaults to "on". */
export function readCacheMode(value: string | undefined) {
  const mode = cacheModes.find((candidate) => candidate === (value ?? "on"));
  if (!mode) throw new Error(`API_CACHE must be one of ${cacheModes.join(", ")}, not ${value}.`);
  return mode;
}

function locateEntry(directory: string, url: string | URL, init?: RequestInit) {
  const request = [init?.method ?? "GET", String(url), String(init?.body ?? "")].join("\n");
  const key = createHash("sha256").update(request).digest("hex");
  return {
    metaPath: path.join(directory, `${key}.json`),
    bodyPath: path.join(directory, `${key}.body`),
  } satisfies CacheEntry;
}

function isWorthStoring(response: Response) {
  return (response.ok || response.status === 404) && response.body !== null;
}

/** Writes the body first and the metadata last, so that an entry with metadata is complete. */
async function storeResponse({ metaPath, bodyPath }: CacheEntry, url: string, response: Response) {
  const partialPath = `${bodyPath}.partial-${randomUUID()}`;
  const body = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  await pipeline(body, createWriteStream(partialPath));
  await rename(partialPath, bodyPath);
  const stored = { url, status: response.status, headers: [...response.headers] };
  await writeFile(metaPath, JSON.stringify(stored satisfies StoredResponse));
}

function readStoredResponse({ metaPath, bodyPath }: CacheEntry) {
  const { status, headers } = JSON.parse(readFileSync(metaPath, "utf8")) as StoredResponse;
  const body = Readable.toWeb(createReadStream(bodyPath)) as globalThis.ReadableStream;
  return new Response(body, { status, headers });
}
