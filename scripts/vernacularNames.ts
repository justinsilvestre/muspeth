import type { ConnectionSource } from "../src/shared/graph.ts";
import { isWrittenInScriptOf, toLanguageTag } from "./languageTags.ts";

/** A vernacular name as GBIF's species API gives it. */
export type GbifVernacularName = {
  vernacularName: string;
  /** An ISO 639 code, for example "jpn". */
  language?: string;
  /** The title of the checklist the name comes from. */
  source?: string;
  /** The checklist's own record of the taxon. */
  sourceTaxonKey?: number;
};

/** A checklist that vernacular names come from, with its licence as an SPDX identifier. */
export type Checklist = { datasetKey: string; title: string; licence: string };

/** A name of an organism in one language, with the checklists that give it. */
export type OrganismName = {
  nodeId: string;
  /** The organism's own rank, for example "genus". */
  rank: string;
  language: string;
  name: string;
  licence: string;
  sources: ConnectionSource[];
};

type NameLimits = { perLanguage: number; total: number };
type NameCandidate = ReturnType<typeof toCandidate> & { order: number; recordCount: number };

/** The languages of the sample's names, whose names are kept before those of other languages. */
const preferredLanguages = ["en", "ja", "zh", "ko", "fr", "de", "es"];
/** Licences from the most to the least permissive. */
const licencesByPermissiveness = ["CC0-1.0", "CC-BY-4.0", "CC-BY-NC-4.0", "unspecified"];

/** Identifies a name's checklist by its title, or by the checklist's record when it has none. */
export function toChecklistKey({ source, sourceTaxonKey }: GbifVernacularName) {
  return source ?? `taxon:${sourceTaxonKey}`;
}

/**
 * Picks the names worth keeping, at most `perLanguage` in each language and `total` in all.
 * Every language's first name comes before any language's second name.
 * Among those, names in the sample's languages come first, then names reported by more checklists.
 * Names without a language, scientific names and names romanized out of their language's script are left out.
 */
export function selectVernacularNames(
  records: GbifVernacularName[],
  scientificName: string,
  limits: NameLimits,
) {
  const candidates = new Map<string, NameCandidate>();
  for (const record of records) {
    const candidate = toCandidate(record, scientificName);
    if (!candidate) continue;
    const key = `${candidate.language}\n${candidate.name.toLowerCase()}`;
    const existing = candidates.get(key) ?? {
      ...candidate,
      order: candidates.size,
      recordCount: 0,
    };
    existing.recordCount += 1;
    existing.checklistKeys = [...new Set([...existing.checklistKeys, ...candidate.checklistKeys])];
    candidates.set(key, existing);
  }
  return rankWithinLanguages([...candidates.values()], limits);
}

function toCandidate(record: GbifVernacularName, scientificName: string) {
  const language = toLanguageTag(record.language ?? "");
  const name = record.vernacularName.trim();
  if (!language || language === "la" || !name) return null;
  if (name.toLowerCase() === scientificName.toLowerCase()) return null;
  if (!isWrittenInScriptOf(name, language)) return null;
  return { language, name, checklistKeys: [toChecklistKey(record)] };
}

function rankWithinLanguages(candidates: NameCandidate[], { perLanguage, total }: NameLimits) {
  const byPopularity = candidates.sort(
    (a, b) => b.recordCount - a.recordCount || a.order - b.order,
  );
  const seenPerLanguage = new Map<string, number>();
  const ranked = byPopularity.map((candidate) => {
    const place = seenPerLanguage.get(candidate.language) ?? 0;
    seenPerLanguage.set(candidate.language, place + 1);
    return { candidate, place };
  });
  return ranked
    .filter(({ place }) => place < perLanguage)
    .sort(
      (a, b) =>
        a.place - b.place ||
        toPreference(a.candidate.language) - toPreference(b.candidate.language),
    )
    .slice(0, total)
    .map(({ candidate: { language, name, checklistKeys } }) => ({ language, name, checklistKeys }));
}

function toPreference(language: string) {
  const index = preferredLanguages.indexOf(language);
  return index === -1 ? preferredLanguages.length : index;
}

/** Attaches the organism and its checklists' citations and most permissive licence to each name. */
export function toOrganismNames(
  organism: { nodeId: string; rank: string },
  names: ReturnType<typeof selectVernacularNames>,
  checklistsByKey: Map<string, Checklist>,
) {
  return names.map(({ language, name, checklistKeys }) => {
    const checklists = checklistKeys.flatMap((key) => checklistsByKey.get(key) ?? []);
    return {
      ...organism,
      language,
      name,
      licence: choosePermissiveLicence(checklists.map(({ licence }) => licence)),
      sources: checklists.map(toChecklistSource),
    } satisfies OrganismName;
  });
}

/** Picks the most permissive licence, since a name may be used under any checklist that gives it. */
export function choosePermissiveLicence(licences: string[]) {
  const ranks = licences.map((licence) => licencesByPermissiveness.indexOf(licence));
  const best = Math.min(...ranks.filter((rank) => rank >= 0));
  return licencesByPermissiveness[best] ?? "unspecified";
}

function toChecklistSource({ datasetKey, title }: Checklist) {
  return {
    datasetId: datasetKey,
    datasetCitation: title,
    studyCitation: null,
    studyUrl: `https://www.gbif.org/dataset/${datasetKey}`,
    recordCount: null,
  } satisfies ConnectionSource;
}

/** Turns a GBIF dataset's licence URL into an SPDX identifier. */
export function toSpdxLicence(licenceUrl: string | undefined) {
  if (licenceUrl?.includes("publicdomain/zero/1.0")) return "CC0-1.0";
  if (licenceUrl?.includes("licenses/by-nc/4.0")) return "CC-BY-NC-4.0";
  if (licenceUrl?.includes("licenses/by/4.0")) return "CC-BY-4.0";
  return "unspecified";
}
