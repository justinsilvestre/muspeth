import type { NodeName } from "../src/shared/graph.ts";
import type { GlobiTaxon } from "./globiRecords.ts";

/** A Wikidata item that may stand for an organism. */
export type WikidataTaxon = {
  /** The item's identifier, for example "Q1044186". */
  qid: string;
  /** The item's scientific names (property P225). */
  taxonNames: string[];
  labels: NodeName[];
};

type WikidataChoice = { taxon: WikidataTaxon; isAmbiguous: boolean };

/**
 * Picks the Wikidata item for a scientific name, preferring items whose taxon name matches it
 * exactly and, among several, the oldest item.
 */
export function chooseWikidataTaxon(name: string, candidates: WikidataTaxon[]) {
  const exactMatches = candidates.filter((candidate) => candidate.taxonNames.includes(name));
  const pool = exactMatches.length > 0 ? exactMatches : candidates;
  const [taxon] = [...pool].sort((a, b) => toItemNumber(a) - toItemNumber(b));
  if (!taxon) return null;
  return { taxon, isAmbiguous: pool.length > 1 } satisfies WikidataChoice;
}

function toItemNumber({ qid }: WikidataTaxon) {
  return Number(qid.slice(1));
}

/**
 * Gives an organism one identifier: an existing node's, else a Wikidata item's, else GloBI's own.
 * The quality flags describe doubts about the identification.
 */
export function identifyOrganism(
  taxon: GlobiTaxon,
  choice: WikidataChoice | null,
  existingNodeId?: string,
) {
  const isUnmatched = isUnmatchedName(taxon);
  return {
    id: existingNodeId ?? toNewNodeId(taxon, choice, isUnmatched),
    qualityFlags: [
      isUnmatched && "unmatched_name",
      choice?.isAmbiguous && "ambiguous_wikidata_id",
    ].filter((flag) => typeof flag === "string"),
  };
}

export function isUnmatchedName({ externalId }: GlobiTaxon) {
  return externalId === null || externalId.toLowerCase() === "no:match";
}

function toNewNodeId(taxon: GlobiTaxon, choice: WikidataChoice | null, isUnmatched: boolean) {
  if (choice) return `wikidata:${choice.taxon.qid}`;
  if (isUnmatched || taxon.externalId === null) return `globi:${taxon.name}`;
  const [prefix = "", ...rest] = taxon.externalId.split(":");
  return `${prefix.toLowerCase()}:${rest.join(":")}`;
}

/** Reads GloBI's common names, skipping any without a language code. */
export function parseCommonNames(commonNames: string) {
  return commonNames.split("|").flatMap((entry) => {
    const match = entry.trim().match(/^(.+?)\s*@([\w-]+)$/);
    return match?.[1] && match[2] ? [{ language: match[2], name: match[1] }] : [];
  });
}

/** Lists the names of an organism from GloBI and Wikidata, other than its scientific name. */
export function listOrganismNames(taxon: GlobiTaxon, choice: WikidataChoice | null) {
  const names = [...parseCommonNames(taxon.commonNames ?? ""), ...(choice?.taxon.labels ?? [])];
  const uniqueNames = new Map(names.map((name) => [`${name.language}\n${name.name}`, name]));
  return [...uniqueNames.values()].filter(
    ({ name }) => name.toLowerCase() !== taxon.name.toLowerCase(),
  ) satisfies NodeName[];
}
