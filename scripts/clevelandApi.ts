import { type ClevelandRecord, clevelandFields } from "./clevelandRecords.ts";
import { fetchJsonPolitely } from "./fetchJsonPolitely.ts";
import { createRequestSpacer } from "./requestSpacer.ts";

const apiUrl = "https://openaccess-api.clevelandart.org/api/artworks/";

/** The most search results read for one name. */
const searchLimit = 40;

const waitForTurn = createRequestSpacer(150);

/** Lists the CC0 records with pictures whose titles contain the name. */
export async function searchClevelandTitles(name: string) {
  const url = new URL(apiUrl);
  url.searchParams.set("title", name);
  url.searchParams.set("cc0", "1");
  url.searchParams.set("has_image", "1");
  url.searchParams.set("limit", String(searchLimit));
  url.searchParams.set("fields", clevelandFields.join(","));
  const result = (await fetchJsonPolitely(url.href, waitForTurn)) as {
    data: ClevelandRecord[];
  } | null;
  return result?.data ?? [];
}
