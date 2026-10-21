import type { ConnectionSource } from "../src/shared/graph.ts";
import type { MangalDataset, MangalNetwork, MangalReference } from "./mangalRecords.ts";

/** Mangal publishes networks under CC0 unless the original deposit has a licence of its own. */
const defaultLicence = "CC0-1.0";

/**
 * Web of Life gives no formal licence. It allows free use on condition that the work credits
 * Web of Life (www.web-of-life.es) and preferably each network's authors.
 */
const webOfLifeLicence = "LicenseRef-web-of-life-attribution";

/** Curated collections that Mangal copied networks from, by the host of the address it cites. */
const collectionByHost: Record<string, Collection> = {
  "www.web-of-life.es": "web-of-life",
  "www.nceas.ucsb.edu": "iwdb",
  "globalwebdb.com": "globalwebdb",
  "www.globalwebdb.com": "globalwebdb",
};

export type Collection = "web-of-life" | "iwdb" | "globalwebdb";

/** Identifies a Mangal network in the graph, for example "mangal:948". */
export function toNetworkKey({ id }: MangalNetwork) {
  return `mangal:${id}`;
}

/** Gives the address of a Mangal network in its API. */
export function toNetworkUrl({ id }: MangalNetwork) {
  return `https://mangal.io/api/v2/network/${id}`;
}

/** Names the curated collection that a Mangal network was copied from, if any. */
export function readSourceCollection(reference: MangalReference | null) {
  const host = reference?.dataUrl?.match(/^https?:\/\/([^/]+)/)?.[1]?.toLowerCase() ?? "";
  return collectionByHost[host] ?? null;
}

export function toNetworkLicence(reference: MangalReference | null) {
  return readSourceCollection(reference) === "web-of-life" ? webOfLifeLicence : defaultLicence;
}

/** Credits a network to Mangal, under its dataset, and to the study that reported it. */
export function toNetworkSource(
  network: MangalNetwork,
  dataset: MangalDataset | null,
  reference: MangalReference | null,
) {
  const datasetName = dataset ? ` in dataset ${dataset.name}` : "";
  return {
    datasetId: toNetworkKey(network),
    datasetCitation: `Mangal network ${network.name}${datasetName}: ${network.description}. ${toNetworkUrl(network)}`,
    studyCitation: reference && toStudyCitation(reference),
    studyUrl: reference && toStudyUrl(reference),
    recordCount: null,
  } satisfies ConnectionSource;
}

/**
 * Credits a network that Mangal copied from Web of Life to Web of Life, as its terms require,
 * and to the study that reported it.
 * `networkId` is Web of Life's own identifier, for example "M_PL_056", when it is known.
 */
export function toWebOfLifeSource(networkId: string | null, reference: MangalReference | null) {
  const networkCitation = networkId ? `Web of Life network ${networkId}. ` : "";
  return {
    datasetId: networkId ? `web-of-life:${networkId}` : "web-of-life",
    datasetCitation: `${networkCitation}Web of Life: ecological networks database. https://www.web-of-life.es`,
    studyCitation: reference && toStudyCitation(reference),
    studyUrl: reference && toStudyUrl(reference),
    recordCount: null,
  } satisfies ConnectionSource;
}

/** Cites a study by the authors, year and title in its BibTeX entry, else by its first author. */
export function toStudyCitation(reference: MangalReference) {
  const author = readBibtexField(reference.bibtex, "author") ?? reference.firstAuthor;
  const year = readBibtexField(reference.bibtex, "year") ?? reference.year;
  const title = readBibtexField(reference.bibtex, "title");
  if (!author) return null;
  return [`${author.replace(/,$/, "")}${year ? ` (${year})` : ""}.`, title && `${title}.`]
    .filter(Boolean)
    .join(" ");
}

function readBibtexField(bibtex: string | null, field: string) {
  const pattern = new RegExp(`\\b${field}\\s*=\\s*\\{((?:[^{}]|\\{[^{}]*\\})*)\\}`, "i");
  const value = bibtex?.match(pattern)?.[1]?.replaceAll(/[{}]/g, "");
  return (
    value
      ?.replace(/\s+/g, " ")
      .replace(/[\s,]+$/, "")
      .trim() || null
  );
}

/** Links a study through its DOI, else its paper's address, else where Mangal took it from. */
export function toStudyUrl({ doi, paperUrl, dataUrl }: MangalReference) {
  const bareDoi = doi?.trim().replace(/^(https?:\/\/doi\.org\/|doi:)/i, "");
  if (bareDoi?.startsWith("10.")) return `https://doi.org/${bareDoi}`;
  return paperUrl ?? dataUrl;
}
