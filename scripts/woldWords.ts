import type { ConnectionSource } from "../src/shared/graph.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import { toGlottologLanguageTag } from "./languageTags.ts";
import type { FolkTaxonLink } from "./organismTaxa.ts";
import { keepFinestConnections, toStoryConnection } from "./storyConnection.ts";
import { toWordId, type WordForm } from "./wordForms.ts";

/** Rows of the WOLD CLDF tables that the import reads, keyed by column name. */
export type WoldTables = {
  languages: Record<string, string>[];
  forms: Record<string, string>[];
  borrowings: Record<string, string>[];
};

type WoldWord = { row: Record<string, string>; word: WordForm; link: FolkTaxonLink };

export const woldLicence = "CC-BY-4.0";
export const woldCitation =
  "Haspelmath, Martin & Tadmor, Uri (eds.) 2009. World Loanword Database. Leipzig: Max Planck Institute for Evolutionary Anthropology. CLDF dataset lexibank/wold v4.2.";

/**
 * Turns WOLD's words for the meanings of the linked folk taxa into word nodes.
 * Each word names the folk taxon's organisms,
 * and each loanword is linked to the word it was borrowed from.
 * WOLD rates borrowing from 1 (clearly borrowed) to 5 (no evidence).
 * Words rated 1 to 3 are linked to their source, and those rated 3 ("perhaps") are flagged as uncertain.
 */
export function toWoldImport(tables: WoldTables, links: FolkTaxonLink[]) {
  const words = listWords(tables, links);
  const borrowingsByFormId = Map.groupBy(tables.borrowings, (row) => row.Target_Form_ID ?? "");
  const borrowings = words.flatMap(({ row, word }) =>
    (borrowingsByFormId.get(row.ID ?? "") ?? []).flatMap((borrowing) =>
      toBorrowing(row, word, borrowing),
    ),
  );
  const forms = [...words.map(({ word }) => word), ...borrowings.map(({ donor }) => donor)];
  return {
    nodes: forms.map(toWordDraft),
    connections: keepFinestConnections([
      ...words.flatMap(toNamingConnections),
      ...borrowings.map(({ connection }) => connection),
    ]),
    forms,
  };
}

function listWords({ languages, forms }: WoldTables, links: FolkTaxonLink[]) {
  const tagsByLanguageId = new Map(
    languages.map((row) => [
      row.ID,
      toGlottologLanguageTag(row.Glottocode ?? "", row.ISO639P3code),
    ]),
  );
  const formsByMeaningId = Map.groupBy(forms, (row) => row.Parameter_ID ?? "");
  return links.flatMap((link) =>
    link.folkTaxon.woldMeaningIds.flatMap((meaningId) =>
      (formsByMeaningId.get(meaningId) ?? []).flatMap((row) => {
        const language = tagsByLanguageId.get(row.Language_ID);
        const form = toWoldForm(row);
        return language && form ? [{ row, word: { language, form }, link } satisfies WoldWord] : [];
      }),
    ),
  );
}

/** Reads a word in its own script where WOLD gives one, taking the first of several spellings. */
export function toWoldForm(row: Record<string, string>) {
  const written = row.original_script || row.Form || "";
  return (written.split(/[,、;/]/)[0] ?? "").replaceAll("_", " ").trim();
}

function toNamingConnections({ row, word, link }: WoldWord) {
  return link.organisms.map((organism) =>
    toStoryConnection({
      sourceNodeId: organism.nodeId,
      targetNodeId: toWordId(word),
      relation: "named by",
      taxonomicLevel: link.folkTaxon.taxon.rank,
      licence: woldLicence,
      qualityFlags: link.isPushedDown ? ["derived_from_coarser_level"] : [],
      sources: [toWoldSource(row)],
    }),
  );
}

function toBorrowing(
  row: Record<string, string>,
  word: WordForm,
  borrowing: Record<string, string>,
) {
  const rating = Number.parseInt(row.Borrowed ?? "", 10);
  const language = toGlottologLanguageTag(borrowing.Source_languoid_glottocode ?? "");
  const form = cleanDonorWord(borrowing.Source_word ?? "");
  if (!(rating <= 3) || !language || !form) return [];
  const donor = { language, form };
  if (toWordId(donor) === toWordId(word)) return [];
  const isUncertain = rating === 3 || borrowing.Source_certain === "no";
  const connection = toStoryConnection({
    sourceNodeId: toWordId(word),
    targetNodeId: toWordId(donor),
    relation: "borrowed from",
    taxonomicLevel: null,
    licence: woldLicence,
    qualityFlags: isUncertain ? ["uncertain_borrowing"] : [],
    sources: [toWoldSource(row)],
  });
  return [{ donor, connection }];
}

/**
 * Reads the word a loanword was borrowed from,
 * dropping notes in parentheses and keeping the first of several variants.
 * Gives null for a field that holds a comment instead of a word.
 */
export function cleanDonorWord(sourceWord: string) {
  const withoutNotes = sourceWord.replaceAll(/\s*\([^)]*\)/g, "");
  const word = (withoutNotes.split(/[,;、/]/)[0] ?? "").trim();
  return word && word.length <= 40 && !/[:"“”]/.test(word) ? word : null;
}

function toWoldSource(row: Record<string, string>) {
  return {
    datasetId: "wold",
    datasetCitation: woldCitation,
    studyCitation: null,
    studyUrl: `https://wold.clld.org/word/${row.Word_ID}`,
    recordCount: null,
  } satisfies ConnectionSource;
}

function toWordDraft(word: WordForm) {
  return {
    id: toWordId(word),
    kind: "word",
    label: word.form,
    names: [{ language: word.language, name: word.form }],
  } satisfies NodeDraft;
}
