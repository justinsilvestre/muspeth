import { parseTsv } from "./parseTsv.ts";
import type { TraitRecord } from "./traitRecord.ts";

/**
 * The FungalTraits columns that describe how a genus lives, each with the trait name it is read
 * under. Columns of form (such as fruitbody type) and of lineage are left out, so that likeness
 * reflects ways of life more than ancestry.
 */
const lifestyleColumns = {
  primary_lifestyle: "lifestyle",
  Secondary_lifestyle: "lifestyle",
  Endophytic_interaction_capability_template: "endophytic capability",
  Plant_pathogenic_capacity_template: "plant pathogenic capacity",
  Decay_substrate_template: "decay substrate",
  Decay_type_template: "decay type",
  Aquatic_habitat_template: "aquatic habitat",
  Animal_biotrophic_capacity_template: "animal biotrophic capacity",
  Ectomycorrhiza_exploration_type_template: "ectomycorrhizal exploration type",
  primary_photobiont: "photobiont",
  secondary_photobiont: "photobiont",
};

/** A genus's lifestyle traits, each written as "trait:value", for example "lifestyle:ectomycorrhizal". */
export type FungalTraits = Set<string>;

/** Reads the FungalTraits genus table, skipping genera without a primary lifestyle. */
export function parseFungalTraits(text: string) {
  const records = new Map<string, TraitRecord<FungalTraits>>();
  for (const row of parseTsv(text)) {
    const name = row.GENUS?.trim();
    if (!name || !row.primary_lifestyle || records.has(name)) continue;
    records.set(name, {
      name,
      group: row.Phylum ?? "",
      traits: readLifestyleTraits(row),
      names: [],
      gbifHints: readGbifHints(row),
    });
  }
  return [...records.values()];
}

function readLifestyleTraits(row: Record<string, string>) {
  return new Set(
    Object.entries(lifestyleColumns).flatMap(([column, trait]) =>
      (row[column] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value !== "" && value !== "unknown")
        .map((value) => `${trait}:${value}`),
    ),
  ) satisfies FungalTraits;
}

function readGbifHints({ Phylum, Class }: Record<string, string>) {
  const hints = { phylum: Phylum, class: Class, rank: "GENUS" };
  return Object.fromEntries(
    Object.entries(hints).flatMap(([key, value]) =>
      value && !value.includes("incertae sedis") ? [[key, value]] : [],
    ),
  );
}

/** Rates how alike two genera live, from 0 to 1, as the Jaccard index of their traits. */
export function compareFungalTraits(first: FungalTraits, second: FungalTraits) {
  const sharedCount = [...first].filter((trait) => second.has(trait)).length;
  const unionCount = first.size + second.size - sharedCount;
  return unionCount === 0 ? 0 : sharedCount / unionCount;
}
