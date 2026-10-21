import type { Taxon, TaxonPlacement } from "../shared/taxonomy";
import { type NodeMediaRow, toNodeMedia } from "./graphQueries";
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

/** Gives the images of the organisms placed in the taxonomy, keyed by node ID. Organisms without an image are left out. */
export async function listPlacedOrganismMedia(db: SqlDatabase) {
  const { results } = await db
    .prepare(
      `SELECT id, media_url, media_licence, media_credit, media_page_url FROM nodes
      WHERE media_url IS NOT NULL AND media_licence IS NOT NULL
        AND id IN (SELECT node_id FROM taxon_placements)`,
    )
    .all<NodeMediaRow>();
  return Object.fromEntries(results.map((row) => [row.id, toNodeMedia(row)]));
}
