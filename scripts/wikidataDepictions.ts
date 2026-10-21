import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import { type Artwork, type Museum, toYearInterval } from "./artworkDrafts.ts";
import { type ArtworkMatch, rankMatch } from "./artworkSelection.ts";
import { toCommonsFileTitle } from "./commonsMedia.ts";
import type { NodeMedia } from "./graphDrafts.ts";
import { type SparqlRow, toQid } from "./sparqlRows.ts";

/** Credits Wikidata for the statements that works depict organisms. */
export const wikidataDepictions = {
  datasetId: "wikidata",
  datasetCitation: "Wikidata, statements that works depict a subject (property P180), CC0.",
} satisfies Museum;

/** An organism with its Wikidata item and the items of the taxa above it, up to its family. */
export type DepictedOrganism = { id: string; qid: string; ancestorQids: string[] };

/** A work that Wikidata says depicts an organism, or a taxon above it, before its details are known. */
export type DepictionCandidate = {
  organismId: string;
  workQid: string;
  /** The item that the work's "depicts" statement names: the organism's or an ancestor's. */
  subjectQid: string;
  by: "id" | "ancestor";
};

/**
 * The ranks of genus and subgenus. A work that depicts a taxon above the organism counts only at
 * these ranks, since works that depict a whole family, such as the daisy family, would otherwise
 * be linked to hundreds of organisms.
 */
const genusRankQids = ["Q34740", "Q3238261"];

/** Keeps the ancestors of genus or subgenus rank, given the rank of each ancestor. */
export function keepGenusAncestors(ancestorQids: string[], rankQidByQid: Map<string, string>) {
  return ancestorQids.filter((qid) => genusRankQids.includes(rankQidByQid.get(qid) ?? ""));
}

/** Pairs each organism with the works that depict it or a taxon above it. */
export function listDepictionCandidates(rows: SparqlRow[], organisms: DepictedOrganism[]) {
  const worksBySubject = Map.groupBy(rows, (row) => toQid(row.subject));
  const listWorks = (organismId: string, subjectQid: string, by: DepictionCandidate["by"]) =>
    (worksBySubject.get(subjectQid) ?? []).map(
      (row) =>
        ({ organismId, workQid: toQid(row.work), subjectQid, by }) satisfies DepictionCandidate,
    );
  return organisms.flatMap(({ id, qid, ancestorQids }) => [
    ...listWorks(id, qid, "id"),
    ...ancestorQids.flatMap((ancestorQid) => listWorks(id, ancestorQid, "ancestor")),
  ]);
}

/**
 * Keeps at most `limit` works for each organism, each work once. Works that depict the organism
 * itself come first, then those that depict an ancestor, each in the order of their item numbers.
 */
export function selectDepictionCandidates(candidates: DepictionCandidate[], limit: number) {
  const byOrganism = Map.groupBy(candidates, ({ organismId }) => organismId);
  return [...byOrganism.values()].flatMap((organismCandidates) => {
    const bestByWork = new Map<string, DepictionCandidate>();
    for (const candidate of organismCandidates.toSorted(compareCandidates)) {
      if (!bestByWork.has(candidate.workQid)) bestByWork.set(candidate.workQid, candidate);
    }
    return [...bestByWork.values()].slice(0, limit);
  });
}

function compareCandidates(a: DepictionCandidate, b: DepictionCandidate) {
  return rankMatch(a) - rankMatch(b) || toItemNumber(a.workQid) - toItemNumber(b.workQid);
}

function toItemNumber(qid: string) {
  return Number(qid.slice(1));
}

/** Picks one image title for each item: the first in alphabetical order, so that runs agree. */
export function pickImageTitles(rows: SparqlRow[], itemVariable: string) {
  const titles = new Map<string, string>();
  for (const row of rows.toSorted((a, b) => (a.image ?? "").localeCompare(b.image ?? ""))) {
    const qid = toQid(row[itemVariable]);
    if (row.image && !titles.has(qid)) titles.set(qid, toCommonsFileTitle(row.image));
  }
  return titles;
}

/**
 * Converts a candidate into an artwork match, given the detail rows of its work and the media of
 * the work's image. Gives nothing when the image cannot be linked under a known licence.
 */
export function toDepictionMatch(
  candidate: DepictionCandidate,
  detailRows: SparqlRow[],
  media: NodeMedia | null,
) {
  if (!media || detailRows.length === 0) return null;
  const isReferenced = detailRows.some(
    (row) => toQid(row.subject) === candidate.subjectQid && row.reference,
  );
  return {
    organismId: candidate.organismId,
    artwork: toWikidataArtwork(candidate.workQid, detailRows, media),
    by: candidate.by,
    otherFlags: isReferenced ? [] : (["unreferenced_statement"] satisfies QualityFlag[]),
  } satisfies ArtworkMatch;
}

function toWikidataArtwork(workQid: string, rows: SparqlRow[], media: NodeMedia) {
  const title = rows[0]?.workLabel ?? workQid;
  const creator = pickFirstLabel(rows, "creatorLabel");
  const collection = pickFirstLabel(rows, "collectionLabel");
  const years = rows.flatMap(({ inception }) => toYear(inception));
  const date = years.length > 0 ? toYearInterval(Math.min(...years), Math.max(...years)) : null;
  const parts = [title, creator, date].filter(Boolean);
  return {
    id: `wikidata:${workQid}`,
    title,
    url: `https://www.wikidata.org/wiki/${workQid}`,
    imageUrl: media.url,
    imageLicence: media.licence,
    imageCredit: media.credit ?? null,
    imagePageUrl: media.pageUrl ?? null,
    date,
    citation: `${parts.join(", ")}.${collection ? ` ${collection}.` : ""}`,
  } satisfies Artwork;
}

/**
 * Picks the first label in alphabetical order, skipping the item numbers and addresses that
 * Wikidata gives for unlabelled or unknown values.
 */
function pickFirstLabel(rows: SparqlRow[], variable: string) {
  const labels = rows.flatMap((row) => row[variable] ?? []);
  return labels.filter((label) => !/^(Q\d+|https?:.*)$/.test(label)).toSorted()[0] ?? null;
}

function toYear(dateTime: string | undefined) {
  const year = dateTime?.match(/^(-?\d+)-/)?.[1];
  return year === undefined ? [] : [Number(year)];
}
