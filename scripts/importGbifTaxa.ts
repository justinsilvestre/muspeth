/**
 * Matches every organism node against the GBIF backbone taxonomy and stores the matched lineages.
 * Usage: npm run db:import-taxa -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import type { Taxon, TaxonPlacement } from "../src/shared/taxonomy.ts";
import { executeD1Script, queryD1 } from "./d1.ts";
import { type GbifMatch, toTaxonomySql, toTaxonPlacement, toTaxonRows } from "./gbifTaxonomy.ts";

const taxa: Taxon[] = [];
const placements: TaxonPlacement[] = [];
const organisms = queryD1<{ id: string; label: string }>(
  "SELECT id, label FROM nodes WHERE kind = 'organism'",
);
for (const organism of organisms) {
  const match = await fetchGbifMatch(organism.label);
  const placement = toTaxonPlacement(organism.id, match);
  if (!placement) console.warn(`No GBIF match for ${organism.label} (${organism.id})`);
  else placements.push(placement);
  taxa.push(...toTaxonRows(match));
}
executeD1Script(toTaxonomySql(taxa, placements));
console.log(
  `Placed ${placements.length} organisms in ${new Set(taxa.map((taxon) => taxon.id)).size} taxa.`,
);

async function fetchGbifMatch(scientificName: string) {
  const url = new URL("https://api.gbif.org/v1/species/match");
  url.searchParams.set("scientificName", scientificName);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GBIF responded ${response.status} for ${scientificName}`);
  return (await response.json()) as GbifMatch;
}
