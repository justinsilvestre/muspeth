import { fetchJsonPolitely } from "./fetchJsonPolitely.ts";
import type { MetObject } from "./metObjects.ts";
import { createRequestSpacer } from "./requestSpacer.ts";

const apiUrl = "https://collectionapi.metmuseum.org/public/collection";

/** The most search results read for one tag. */
const searchLimit = 40;

/**
 * The Met asks for at most 80 requests a second, but its firewall has paused clients that came
 * close to that, so requests are sent far less often.
 */
const waitForTurn = createRequestSpacer(250);

/** Lists the objects with pictures whose subject tags match the term, best matches first. */
export async function searchMetTags(term: string) {
  const url = new URL(`${apiUrl}/v1.1/search`);
  url.searchParams.set("tags", "true");
  url.searchParams.set("hasImages", "true");
  url.searchParams.set("limit", String(searchLimit));
  url.searchParams.set("q", term);
  const result = (await fetchJsonPolitely(url.href, waitForTurn)) as {
    objectIDs: number[] | null;
  } | null;
  return result?.objectIDs ?? [];
}

const objectsById = new Map<number, Promise<MetObject | null>>();

/** Fetches one object, remembering it for the rest of the run. */
export function fetchMetObject(objectId: number) {
  const known = objectsById.get(objectId);
  if (known) return known;
  const fetched = fetchJsonPolitely(
    `${apiUrl}/v1/objects/${objectId}`,
    waitForTurn,
  ) as Promise<MetObject | null>;
  objectsById.set(objectId, fetched);
  return fetched;
}
