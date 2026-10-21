import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { Taxon, TaxonPlacement } from "../src/shared/taxonomy.ts";
import { quoteSql } from "./quoteSql.ts";

export const ranks = ["kingdom", "phylum", "class", "order", "family", "genus", "species"] as const;
const source = "gbif_backbone";
const licence = "CC-BY-4.0";

type Rank = (typeof ranks)[number];

/** The parts of a GBIF species match response that the import uses. */
export type GbifMatch = {
  matchType: string;
  usageKey?: number;
  /** The key of the accepted taxon when the matched name is a synonym. */
  acceptedUsageKey?: number;
  canonicalName?: string;
  /** For example "ACCEPTED", "DOUBTFUL" or "SYNONYM". */
  status?: string;
  rank?: string;
  confidence?: number;
  /** The candidates GBIF weighed, listed when the match is requested with `verbose`. */
  alternatives?: GbifMatch[];
  /** Records that the match was chosen with outside help instead of from the name alone. */
  hintedBy?: "globi_lineage";
} & Partial<Record<Rank, string> & Record<`${Rank}Key`, number>>;

/** Lists the matched lineage from kingdom down, skipping ranks GBIF leaves empty. */
export function toTaxonRows(match: GbifMatch) {
  const rows: Taxon[] = [];
  for (const rank of ranks) {
    const key = match[`${rank}Key`];
    const name = match[rank];
    if (key === undefined || name === undefined) continue;
    rows.push({ id: `gbif:${key}`, parentId: rows.at(-1)?.id ?? null, rank, name });
  }
  return rows;
}

export function toTaxonPlacement(nodeId: string, match: GbifMatch) {
  const lowestTaxon = toTaxonRows(match).at(-1);
  if (!lowestTaxon) return null;
  return {
    nodeId,
    taxonId: lowestTaxon.id,
    qualityFlags: listQualityFlags(match),
  } satisfies TaxonPlacement;
}

function listQualityFlags(match: GbifMatch) {
  const flags = [
    match.matchType === "FUZZY" && "fuzzy_name_match",
    match.matchType === "HIGHERRANK" && "higher_rank_match",
    match.status === "SYNONYM" && "synonym_name",
    match.status === "DOUBTFUL" && "doubtful_usage",
    match.hintedBy === "globi_lineage" && "globi_lineage_hint",
  ] satisfies (QualityFlag | false)[];
  return flags.filter((flag) => flag !== false);
}

/** Writes SQL that inserts the taxa and placements, replacing any earlier import of them. */
export function toTaxonomySql(taxa: Taxon[], placements: TaxonPlacement[]) {
  const uniqueTaxa = [...new Map(taxa.map((taxon) => [taxon.id, taxon])).values()];
  return [...uniqueTaxa.map(toTaxonSql), ...placements.map(toPlacementSql)].join("\n");
}

function toTaxonSql({ id, parentId, rank, name }: Taxon) {
  const values = [id, parentId, rank, name, source, licence].map(quoteSql).join(", ");
  return `INSERT INTO taxa (id, parent_id, rank, name, source, licence) VALUES (${values})
  ON CONFLICT (id) DO UPDATE SET parent_id = excluded.parent_id, rank = excluded.rank, name = excluded.name;`;
}

function toPlacementSql({ nodeId, taxonId, qualityFlags }: TaxonPlacement) {
  const values = [nodeId, taxonId, JSON.stringify(qualityFlags)].map(quoteSql).join(", ");
  return `INSERT INTO taxon_placements (node_id, taxon_id, quality_flags) VALUES (${values})
  ON CONFLICT (node_id) DO UPDATE SET taxon_id = excluded.taxon_id, quality_flags = excluded.quality_flags;`;
}
