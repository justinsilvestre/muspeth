import type { Taxon, TaxonPlacement } from "../shared/taxonomy";
import type { SqlDatabase } from "./sqlDatabase";

type TaxonPlacementRow = { node_id: string; taxon_id: string; quality_flags: string };

export async function listTaxa(db: SqlDatabase) {
  const { results } = await db
    .prepare('SELECT id, parent_id AS "parentId", rank, name FROM taxa ORDER BY name')
    .all<Taxon>();
  return results;
}

export async function listTaxonPlacements(db: SqlDatabase) {
  const { results } = await db
    .prepare("SELECT node_id, taxon_id, quality_flags FROM taxon_placements ORDER BY node_id")
    .all<TaxonPlacementRow>();
  return results.map(
    (row) =>
      ({
        nodeId: row.node_id,
        taxonId: row.taxon_id,
        qualityFlags: JSON.parse(row.quality_flags),
      }) satisfies TaxonPlacement,
  );
}
