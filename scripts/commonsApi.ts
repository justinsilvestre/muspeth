import { type CommonsFile, commonsMetadataFields } from "./commonsMedia.ts";
import { chunk } from "./fetchInBatches.ts";
import { fetchJsonPolitely } from "./fetchJsonPolitely.ts";
import { createRequestSpacer } from "./requestSpacer.ts";

const apiUrl = "https://commons.wikimedia.org/w/api.php";

/** The most files described in one request, kept low so that the request address stays short. */
const batchSize = 25;

/** The width of the smaller copy of each image that is linked. */
const thumbnailWidth = 800;

const waitForTurn = createRequestSpacer(200);

type QueryResult = {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages: CommonsFile[];
  };
};

/** Fetches the description of each Commons file, keyed by the title it was asked for. */
export async function fetchCommonsFiles(titles: string[]) {
  const files = new Map<string, CommonsFile>();
  for (const batch of chunk([...new Set(titles)], batchSize)) {
    const result = (await fetchJsonPolitely(toQueryUrl(batch), waitForTurn)) as QueryResult | null;
    const { normalized = [], redirects = [], pages = [] } = result?.query ?? {};
    const renamed = new Map([...normalized, ...redirects].map(({ from, to }) => [from, to]));
    const pagesByTitle = new Map(pages.map((page) => [page.title, page]));
    for (const title of batch) {
      const normalizedTitle = renamed.get(title) ?? title;
      const page = pagesByTitle.get(renamed.get(normalizedTitle) ?? normalizedTitle);
      if (page) files.set(title, page);
    }
  }
  return files;
}

function toQueryUrl(titles: string[]) {
  const url = new URL(apiUrl);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(thumbnailWidth),
    iiextmetadatafilter: commonsMetadataFields.join("|"),
    titles: titles.join("|"),
  }).toString();
  return url.href;
}
