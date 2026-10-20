/**
 * Matches every organism node against the GBIF backbone taxonomy and stores the matched lineages.
 * Usage: npm run db:import-taxa -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Taxon, TaxonPlacement } from "../src/shared/taxonomy.ts";
import { type GbifMatch, toTaxonomySql, toTaxonPlacement, toTaxonRows } from "./gbifTaxonomy.ts";

const location = process.argv.includes("--remote") ? "--remote" : "--local";

const taxa: Taxon[] = [];
const placements: TaxonPlacement[] = [];
for (const organism of queryOrganisms()) {
  const match = await fetchGbifMatch(organism.label);
  const placement = toTaxonPlacement(organism.id, match);
  if (!placement) console.warn(`No GBIF match for ${organism.label} (${organism.id})`);
  else placements.push(placement);
  taxa.push(...toTaxonRows(match));
}
executeSqlFile(toTaxonomySql(taxa, placements));
console.log(
  `Placed ${placements.length} organisms in ${new Set(taxa.map((taxon) => taxon.id)).size} taxa.`,
);

function queryOrganisms() {
  const output = runWrangler([
    "--json",
    "--command",
    "SELECT id, label FROM nodes WHERE kind = 'organism'",
  ]);
  const [{ results }] = JSON.parse(output) as [{ results: { id: string; label: string }[] }];
  return results;
}

async function fetchGbifMatch(scientificName: string) {
  const url = new URL("https://api.gbif.org/v1/species/match");
  url.searchParams.set("scientificName", scientificName);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GBIF responded ${response.status} for ${scientificName}`);
  return (await response.json()) as GbifMatch;
}

function executeSqlFile(sql: string) {
  const sqlPath = path.join(mkdtempSync(path.join(tmpdir(), "gbif-taxa-")), "import.sql");
  writeFileSync(sqlPath, sql);
  runWrangler([`--file=${sqlPath}`]);
}

function runWrangler(args: string[]) {
  return execFileSync("wrangler", ["d1", "execute", "muspeth", location, ...args], {
    encoding: "utf8",
  });
}
