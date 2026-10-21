import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { cachedFetch } from "./cachedFetch.ts";
import { addToMetTagIndex, createMetTagIndex } from "./metTagIndex.ts";
import { readCsvRecords } from "./parseCsv.ts";
import { userAgent } from "./userAgent.ts";

/**
 * The Met's open access CSV, about 340 MB, which the Met updates weekly. GitHub keeps the file in
 * Git LFS storage and serves its contents at this address, so Git LFS is not needed to read it.
 */
const csvUrl =
  "https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv";

/** Reads the Met's open access CSV as it downloads, indexing the subject tags of its objects. */
export async function loadMetTagIndex() {
  const response = await cachedFetch(csvUrl, { headers: { "user-agent": userAgent } });
  if (!response.ok || !response.body) {
    throw new Error(`Download responded ${response.status} for ${csvUrl}`);
  }
  const input = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  const index = createMetTagIndex();
  for await (const record of readCsvRecords(createInterface({ input, crlfDelay: Infinity }))) {
    addToMetTagIndex(index, record);
  }
  return index;
}
