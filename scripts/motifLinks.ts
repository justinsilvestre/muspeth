import type { ConnectionSource } from "../src/shared/graph.ts";
import { motifPhrasesToIgnore } from "./folkTaxa.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import type { FolkTaxonLink } from "./organismTaxa.ts";
import { keepFinestConnections, toStoryConnection } from "./storyConnection.ts";
import { containsSequence, tokenize } from "./wordForms.ts";

type Motif = { code: string; sortKey: string; text: string };
type Token = { word: string; start: number; isCapitalized: boolean };

const labelLength = 200;
/** Chapters A (mythological motifs) and B (animals), which concern organisms most directly. */
const preferredChapters = new Set(["A", "B"]);

export const motifLicence = "CC-BY-4.0";
const motifSource = {
  datasetId: "doi:10.17605/OSF.IO/XEB67",
  datasetCitation:
    "Mellmann, Katja. Thompson's Motif-Index as CSV File (version 2.0). Open Science Framework, 2026.",
  studyCitation:
    "Thompson, Stith. Motif-Index of Folk-Literature. Revised and enlarged edition. Bloomington: Indiana University Press, 1955–1958.",
  studyUrl: "https://doi.org/10.17605/OSF.IO/XEB67",
  recordCount: null,
} satisfies ConnectionSource;

/**
 * Links the organisms of each folk taxon to the motifs that name it,
 * keeping at most `motifLimit` motifs per folk taxon.
 * Motifs that name several of the folk taxa come first,
 * then motifs from chapters A and B, then the rest in the index's order.
 * Every link is flagged as a text match.
 */
export function toMotifImport(
  rows: Record<string, string>[],
  links: FolkTaxonLink[],
  motifLimit: number,
) {
  const motifs = rows.flatMap((row) => toMotif(row) ?? []);
  const mentions = links.map((link) => ({
    link,
    motifs: motifs.filter((motif) => mentionsAnyTerm(motif.text, link.folkTaxon.motifTerms)),
  }));
  const mentionCounts = countMentions(mentions.flatMap(({ motifs }) => motifs));
  const kept = mentions.map(({ link, motifs }) => ({
    link,
    motifs: [...motifs].sort((a, b) => compareMotifs(a, b, mentionCounts)).slice(0, motifLimit),
  }));
  return {
    nodes: kept.flatMap(({ motifs }) => motifs.map(toMotifDraft)),
    connections: keepFinestConnections(
      kept.flatMap(({ link, motifs }) => motifs.flatMap((motif) => toConnections(link, motif))),
    ),
  };
}

/** Reads a motif's statement, without its code or the editor's notes in "[Note: …]". */
function toMotif(row: Record<string, string>) {
  const code = row.code ?? "";
  const motif = (row.MOTIF ?? "").replaceAll(/\s*\[Note:[^\]]*\]/g, "");
  const text = motif.startsWith(`${code}.`) ? motif.slice(code.length + 1).trim() : motif.trim();
  return code && text
    ? ({ code, sortKey: row["[sorting field]"] ?? code, text } satisfies Motif)
    : null;
}

/**
 * Tells whether text names any of the terms.
 * A capitalized term counts only at the start of a sentence,
 * so that names such as "Ram", a god, are not read as the animal.
 */
export function mentionsAnyTerm(text: string, terms: string[]) {
  const tokens = toTokens(text);
  const ignored = findIgnoredPositions(tokens);
  const words = tokens.map(({ word }) => word);
  return terms.some((term) => {
    const termWords = tokenize(term);
    return words.some(
      (_, start) =>
        !ignored.has(start) &&
        containsSequence(words.slice(start, start + termWords.length), termWords) &&
        isCommonNounAt(text, tokens[start]),
    );
  });
}

function toTokens(text: string) {
  return [...text.matchAll(/[\p{L}\p{M}\p{N}'’]+/gu)].map(
    (match) =>
      ({
        word: match[0].toLowerCase(),
        start: match.index,
        isCapitalized: /^\p{Lu}/u.test(match[0]),
      }) satisfies Token,
  );
}

function findIgnoredPositions(tokens: Token[]) {
  const words = tokens.map(({ word }) => word);
  const phrases = motifPhrasesToIgnore.map(tokenize);
  return new Set(
    words.flatMap((_, start) =>
      phrases.some((phrase) => containsSequence(words.slice(start, start + phrase.length), phrase))
        ? [start]
        : [],
    ),
  );
}

function isCommonNounAt(text: string, token: Token | undefined) {
  if (!token?.isCapitalized) return true;
  const before = text.slice(0, token.start).trimEnd();
  return before === "" || /[.:;!?–—]$/.test(before);
}

function countMentions(motifs: Motif[]) {
  const counts = new Map<string, number>();
  for (const { code } of motifs) counts.set(code, (counts.get(code) ?? 0) + 1);
  return counts;
}

function compareMotifs(a: Motif, b: Motif, mentionCounts: Map<string, number>) {
  const byMentions = (mentionCounts.get(b.code) ?? 0) - (mentionCounts.get(a.code) ?? 0);
  const byChapter = Number(isInPreferredChapter(b)) - Number(isInPreferredChapter(a));
  return byMentions || byChapter || a.sortKey.localeCompare(b.sortKey);
}

function isInPreferredChapter({ code }: Motif) {
  return preferredChapters.has(code[0] ?? "");
}

function toMotifDraft({ code, text }: Motif) {
  const label = text.length > labelLength ? `${text.slice(0, labelLength - 1).trimEnd()}…` : text;
  return {
    id: `tmi:${code}`,
    kind: "story_motif",
    label: `${code}. ${label}`,
    names: [{ language: "en", name: label }],
  } satisfies NodeDraft;
}

function toConnections({ folkTaxon, organisms, isPushedDown }: FolkTaxonLink, motif: Motif) {
  return organisms.map((organism) =>
    toStoryConnection({
      sourceNodeId: organism.nodeId,
      targetNodeId: `tmi:${motif.code}`,
      relation: "appears in motif",
      taxonomicLevel: folkTaxon.taxon.rank,
      licence: motifLicence,
      qualityFlags: isPushedDown ? ["text_match", "derived_from_coarser_level"] : ["text_match"],
      sources: [motifSource],
    }),
  );
}
