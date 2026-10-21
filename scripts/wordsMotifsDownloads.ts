import { cachedFetch } from "./cachedFetch.ts";
import { parseCsv } from "./parseCsv.ts";
import { userAgent } from "./userAgent.ts";
import type { WoldTables } from "./woldWords.ts";

/** The WOLD CLDF dataset at a fixed release, so that each run reads the same data. */
const woldUrl = "https://raw.githubusercontent.com/lexibank/wold/v4.2/cldf";
/** Version 2.0 of Mellmann's CSV edition of the Thompson Motif-Index on OSF. */
const motifIndexUrl = "https://osf.io/download/8u2eg/?revision=2";
const headers = { "user-agent": userAgent };

/** Downloads the WOLD tables of languages, word forms and borrowings. */
export async function fetchWoldTables() {
  const [languages, forms, borrowings] = await Promise.all(
    ["languages.csv", "forms.csv", "borrowings.csv"].map((file) => fetchCsv(`${woldUrl}/${file}`)),
  );
  return {
    languages: languages ?? [],
    forms: forms ?? [],
    borrowings: borrowings ?? [],
  } satisfies WoldTables;
}

/** Downloads the rows of the Thompson Motif-Index. */
export function fetchMotifIndexRows() {
  return fetchCsv(motifIndexUrl);
}

async function fetchCsv(url: string) {
  const response = await cachedFetch(url, { headers });
  if (!response.ok) throw new Error(`Download responded ${response.status} for ${url}`);
  return parseCsv(await response.text());
}
