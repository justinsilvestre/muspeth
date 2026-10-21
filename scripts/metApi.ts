import { fetchJsonPolitely } from "./fetchJsonPolitely.ts";
import type { MetObject } from "./metObjects.ts";
import { createRequestSpacer } from "./requestSpacer.ts";

const apiUrl = "https://collectionapi.metmuseum.org/public/collection";

/**
 * The Met asks for at most 80 requests a second, but its firewall has paused clients that came
 * close to that, so requests are sent far less often.
 */
const waitForTurn = createRequestSpacer(250);

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
