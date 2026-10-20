import type { ConnectionSource } from "../src/shared/graph.ts";
import { type SparqlRow, toQid } from "./sparqlRows.ts";

/** The most references kept for one statement. */
const maxReferences = 5;

/** A work that a Wikidata statement cites. */
export type WikidataWork = { title: string | null; doi: string | null; year: string | null };

/** What the references of one statement cite: works, and web addresses. */
export type StatementReference = { workQids: string[]; urls: string[] };

/** Groups rows that give a statement's cited work (`work`) or address (`url`) by the key of the statement. */
export function collectReferences(rows: SparqlRow[], toKey: (row: SparqlRow) => string) {
  const references = new Map<string, StatementReference>();
  for (const row of rows) {
    const key = toKey(row);
    const reference = references.get(key) ?? { workQids: [], urls: [] };
    addOnce(reference.workQids, toQid(row.work));
    addOnce(reference.urls, row.url);
    references.set(key, reference);
  }
  return references;
}

function addOnce(values: string[], value: string | undefined) {
  if (value && !values.includes(value)) values.push(value);
}

/** Reads the title, DOI and publication year of works from rows of one or both Wikidata graphs. */
export function toWorks(rows: SparqlRow[]) {
  const works = new Map<string, WikidataWork>();
  for (const row of rows) {
    const qid = toQid(row.work);
    const known = works.get(qid);
    works.set(qid, {
      title: known?.title ?? row.title ?? row.label ?? null,
      doi: known?.doi ?? row.doi ?? null,
      year: known?.year ?? row.date?.slice(0, 4) ?? null,
    });
  }
  return works;
}

/**
 * Lists the studies that support a Wikidata statement, one for each cited work or address.
 * A statement without references is credited to Wikidata itself, linked to the statement's item.
 */
export function toReferenceSources(
  datasetCitation: string,
  itemQid: string,
  reference: StatementReference | undefined,
  works: Map<string, WikidataWork>,
) {
  const base = { datasetId: "wikidata", datasetCitation, recordCount: null };
  const workSources = (reference?.workQids ?? []).map((qid) => ({
    ...base,
    studyCitation: toCitation(works.get(qid)),
    studyUrl: toWorkUrl(qid, works.get(qid)),
  }));
  const urlSources = (reference?.urls ?? []).map((url) => ({
    ...base,
    studyCitation: null,
    studyUrl: url,
  }));
  const sources = [...workSources, ...urlSources].slice(0, maxReferences);
  if (sources.length > 0) return sources satisfies ConnectionSource[];
  return [
    { ...base, studyCitation: null, studyUrl: `https://www.wikidata.org/wiki/${itemQid}` },
  ] satisfies ConnectionSource[];
}

function toCitation(work: WikidataWork | undefined) {
  if (!work?.title) return null;
  return work.year ? `${work.title} (${work.year})` : work.title;
}

function toWorkUrl(qid: string, work: WikidataWork | undefined) {
  return work?.doi ? `https://doi.org/${work.doi}` : `https://www.wikidata.org/wiki/${qid}`;
}

/** Whether a statement cites any work or address. */
export function isReferenced(reference: StatementReference | undefined) {
  return (reference?.workQids.length ?? 0) + (reference?.urls.length ?? 0) > 0;
}
