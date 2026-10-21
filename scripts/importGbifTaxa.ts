/**
 * Matches every organism node against the GBIF backbone taxonomy and stores the matched lineages.
 * A node is matched through its own GBIF identifier where it has one, and otherwise through its
 * name. When GBIF cannot match a name on its own, for example a genus name used in several
 * kingdoms, the lineage that GloBI's records give for the name settles the match.
 * Usage: npm run db:import-taxa
 */
import type { Taxon, TaxonPlacement } from "../src/shared/taxonomy.ts";
import { executeSqlScript, queryDatabase } from "./database.ts";
import { toTaxonomySql, toTaxonPlacement, toTaxonRows } from "./gbifTaxonomy.ts";
import { matchGraphOrganisms } from "./matchGraphOrganism.ts";

const taxa: Taxon[] = [];
const placements: TaxonPlacement[] = [];
const organisms = queryDatabase<{ id: string; label: string }>(
  "SELECT id, label FROM nodes WHERE kind = 'organism'",
);
for (const { node: organism, match } of await matchGraphOrganisms(organisms)) {
  const placement = toTaxonPlacement(organism.id, match);
  if (!placement) console.warn(`No GBIF match for ${organism.label} (${organism.id})`);
  else placements.push(placement);
  taxa.push(...toTaxonRows(match));
}
executeSqlScript(toTaxonomySql(taxa, placements));
console.log(
  `Placed ${placements.length} organisms in ${new Set(taxa.map((taxon) => taxon.id)).size} taxa.`,
);
