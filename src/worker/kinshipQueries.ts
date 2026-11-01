import { chooseKinshipOrganisms } from "../shared/kinships/chooseKinshipOrganisms";
import { jaccardDistances } from "../shared/kinships/jaccardDistances";
import { type KinshipGrouping, type Kinships, kinshipGroupings } from "../shared/kinships/kinships";
import { lineageDistances } from "../shared/kinships/lineageDistances";
import type { SqlDatabase } from "./sqlDatabase";

const choice = { perClass: 4, max: 32, minKinds: 4 };
const connectionGroupings = kinshipGroupings.filter((grouping) => grouping !== "descent");

type TaxonRow = { id: string; parent_id: string | null; rank: string; name: string };
type OrganismRow = {
  id: string;
  label: string;
  connection_count: number;
  taxon_id: string;
  kind_count: number;
};
type EdgeRow = { source_node_id: string; target_node_id: string; kind: string };

/**
 * Chooses a varied set of well-connected organisms and measures how alike each pair is by descent,
 * and by the neighbours they share through each kind of connection.
 */
export async function listKinships(db: SqlDatabase) {
  const [taxa, organisms] = await Promise.all([
    db.prepare("SELECT id, parent_id, rank, name FROM taxa").all<TaxonRow>(),
    db
      .prepare(
        `WITH ends AS (
          SELECT source_node_id AS node_id, kind FROM connections
          UNION ALL SELECT target_node_id, kind FROM connections
        ), kind_counts AS (
          SELECT node_id, COUNT(DISTINCT kind) AS kind_count FROM ends
          WHERE kind IN (${connectionGroupings.map(() => "?").join(", ")})
          GROUP BY node_id
        )
        SELECT n.id, n.label, n.connection_count, p.taxon_id, k.kind_count
        FROM nodes n
          JOIN taxon_placements p ON p.node_id = n.id
          JOIN kind_counts k ON k.node_id = n.id
        WHERE n.kind = 'organism'`,
      )
      .bind(...connectionGroupings)
      .all<OrganismRow>(),
  ]);
  const lineages = buildLineages(taxa.results, organisms.results);
  const chosenIds = chooseKinshipOrganisms(
    organisms.results.map((row) => ({
      id: row.id,
      className: findRank(lineages.get(row.id), "class") ?? row.id,
      kindCount: row.kind_count,
      connectionCount: row.connection_count,
    })),
    choice,
  );
  const edges = await listEdgesTouching(db, chosenIds);
  const chosen = organisms.results.filter(({ id }) => chosenIds.includes(id));
  const ids = chosen.map(({ id }) => id);
  return {
    organisms: chosen.map(({ id, label }) => ({
      id,
      label,
      kingdom: findRank(lineages.get(id), "kingdom"),
      className: findRank(lineages.get(id), "class"),
    })),
    distances: Object.fromEntries(
      kinshipGroupings.map((grouping) => [
        grouping,
        roundDistances(
          grouping === "descent"
            ? lineageDistances(ids, toNameLineages(lineages))
            : jaccardDistances(ids, listNeighbours(ids, edges, grouping)),
        ),
      ]),
    ) as Record<KinshipGrouping, number[][]>,
  } satisfies Kinships;
}

function buildLineages(taxa: TaxonRow[], organisms: OrganismRow[]) {
  const taxaById = new Map(taxa.map((taxon) => [taxon.id, taxon]));
  const lineageOf = (taxonId: string) => {
    const lineage: TaxonRow[] = [];
    for (let taxon = taxaById.get(taxonId); taxon; taxon = taxaById.get(taxon.parent_id ?? "")) {
      lineage.unshift(taxon);
    }
    return lineage;
  };
  return new Map(organisms.map(({ id, taxon_id }) => [id, lineageOf(taxon_id)]));
}

function toNameLineages(lineages: Map<string, TaxonRow[]>) {
  return new Map([...lineages].map(([id, lineage]) => [id, lineage.map((taxon) => taxon.id)]));
}

function findRank(lineage: TaxonRow[] | undefined, rank: string) {
  return lineage?.find((taxon) => taxon.rank === rank)?.name ?? null;
}

async function listEdgesTouching(db: SqlDatabase, ids: string[]) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const { results } = await db
    .prepare(
      `SELECT source_node_id, target_node_id, kind FROM connections
      WHERE source_node_id IN (${placeholders}) OR target_node_id IN (${placeholders})`,
    )
    .bind(...ids, ...ids)
    .all<EdgeRow>();
  return results;
}

/** Gathers, for each organism, the nodes it links to through connections of one kind. */
function listNeighbours(ids: string[], edges: EdgeRow[], kind: string) {
  const neighbours = new Map(ids.map((id) => [id, new Set<string>()]));
  for (const edge of edges) {
    if (edge.kind !== kind) continue;
    neighbours.get(edge.source_node_id)?.add(edge.target_node_id);
    neighbours.get(edge.target_node_id)?.add(edge.source_node_id);
  }
  return neighbours;
}

function roundDistances(distances: number[][]) {
  return distances.map((row) => row.map((value) => Math.round(value * 1000) / 1000));
}
