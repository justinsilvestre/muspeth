/** The columns requested from GloBI's interaction API, in the order the parser expects them. */
export const globiFields = [
  "source_taxon_name",
  "source_taxon_external_id",
  "source_taxon_path_ranks",
  "source_taxon_common_names",
  "interaction_type",
  "target_taxon_name",
  "target_taxon_external_id",
  "target_taxon_path_ranks",
  "target_taxon_common_names",
  "study_citation",
  "study_source_citation",
  "study_source_id",
] as const;

/**
 * Maps each passive or host-side relation onto its inverse, so that every link points from the
 * organism that acts or depends (the consumer, parasite or visitor) to the one it acts on.
 */
const activeFormOf: Record<string, string> = {
  eatenBy: "eats",
  preyedUponBy: "preysOn",
  killedBy: "kills",
  hasParasite: "parasiteOf",
  hasEndoparasite: "endoparasiteOf",
  hasEctoparasite: "ectoparasiteOf",
  hasParasitoid: "parasitoidOf",
  hostOf: "hasHost",
  pollinatedBy: "pollinates",
  hasPathogen: "pathogenOf",
  hasVector: "vectorOf",
  hasDispersalVector: "dispersalVectorOf",
  createsHabitatFor: "hasHabitat",
  hasEpiphyte: "epiphyteOf",
  ectomycorrhizalHostOf: "hasEctomycorrhizalHost",
  arbuscularMycorrhizalHostOf: "hasArbuscularMycorrhizalHost",
  providesNutrientsFor: "acquiresNutrientsFrom",
  flowersVisitedBy: "visitsFlowersOf",
  visitedBy: "visits",
};

/**
 * GloBI's copies of networks that the connection graph plan says to take from the original
 * collections instead.
 */
const reimportedDatasetIds = new Set([
  "globalbioticinteractions/mangal",
  "globalbioticinteractions/web-of-life",
  "globalbioticinteractions/globalwebdb",
]);

type GlobiField = (typeof globiFields)[number];

export type GlobiTaxon = {
  name: string;
  externalId: string | null;
  rank: string | null;
  /** Pipe-separated names, each suffixed with a language code, as in "human @en | Mensch @de". */
  commonNames: string | null;
};

export type GlobiRecord = {
  subject: GlobiTaxon;
  relation: string;
  object: GlobiTaxon;
  datasetId: string | null;
  citation: string | null;
};

/** Converts GloBI's tabular JSON response into records. */
export function parseGlobiTable(table: { columns: string[]; data: (string | null)[][] }) {
  return table.data.map((row) => {
    const read = (field: GlobiField) => row[table.columns.indexOf(field)] ?? null;
    return {
      subject: readTaxon(read, "source"),
      relation: read("interaction_type") ?? "interactsWith",
      object: readTaxon(read, "target"),
      datasetId: read("study_source_id"),
      citation: read("study_source_citation") ?? read("study_citation"),
    } satisfies GlobiRecord;
  });
}

function readTaxon(read: (field: GlobiField) => string | null, side: "source" | "target") {
  return {
    name: read(`${side}_taxon_name`) ?? "",
    externalId: read(`${side}_taxon_external_id`),
    rank: read(`${side}_taxon_path_ranks`)?.split("|").at(-1)?.trim().toLowerCase() || null,
    commonNames: read(`${side}_taxon_common_names`),
  } satisfies GlobiTaxon;
}

export function orientRecord(record: GlobiRecord) {
  const activeRelation = activeFormOf[record.relation];
  if (!activeRelation) return record;
  return { ...record, subject: record.object, relation: activeRelation, object: record.subject };
}

export function isReimport(record: GlobiRecord) {
  return record.datasetId !== null && reimportedDatasetIds.has(record.datasetId);
}

/**
 * Picks the organisms an organism interacts with most, ranked by the number of datasets that
 * report the interaction and then by the number of records, keeping every partner that `isKept`
 * accepts.
 */
export function selectPartnerNames(
  records: GlobiRecord[],
  organismName: string,
  limit: number,
  isKept: (name: string) => boolean,
) {
  const support = new Map<string, { datasetIds: Set<string | null>; recordCount: number }>();
  for (const record of records) {
    const name = record.subject.name === organismName ? record.object.name : record.subject.name;
    const entry = support.get(name) ?? { datasetIds: new Set(), recordCount: 0 };
    entry.datasetIds.add(record.datasetId);
    entry.recordCount += 1;
    support.set(name, entry);
  }
  const ranked = [...support.entries()]
    .sort(([, a], [, b]) => b.datasetIds.size - a.datasetIds.size || b.recordCount - a.recordCount)
    .map(([name]) => name);
  return ranked.filter((name, index) => index < limit || isKept(name));
}
