/**
 * Loads shared-substance and shared-culture links for the organisms already in the database:
 * - compounds and products that Wikidata lists for them, under the source "wikidata";
 * - artworks from the Met and the Cleveland Museum of Art that depict them, under the sources
 *   "met" and "cleveland".
 * Re-running it replaces what its previous run wrote.
 * Usage: npm run db:import-substances-culture -- [--remote] [--only=wikidata,met,cleveland]
 * Without --remote, it writes to the local development database.
 * With --only, it runs just the listed sources. Without it, it runs all but the Met, whose
 * firewall blocks a search of this size for longer than a full import should take.
 */
import { queryD1 } from "./d1.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { listChosenSources } from "./importSourceChoice.ts";
import { clevelandMuseum, metMuseum, toMuseumImport } from "./museumImport.ts";
import { collectClevelandMatches, collectMetMatches } from "./museumMatches.ts";
import type { MuseumOrganism } from "./museumNames.ts";
import { addWikidataNames } from "./museumOrganisms.ts";
import { listQids } from "./wikidataQueries.ts";
import { collectWikidataSubstances } from "./wikidataSubstanceImport.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const organisms = loadOrganisms();
console.log(`Found ${organisms.length} organisms.`);

const chosenSources = listChosenSources(process.argv, ["wikidata", "cleveland"]);
const isWanted = (source: string) => chosenSources.includes(source);

if (isWanted("wikidata")) {
  const qids = listQids(organisms.map(({ id }) => id));
  store("wikidata", await collectWikidataSubstances(qids));
}
if (isWanted("met") || isWanted("cleveland")) {
  const namedOrganisms = await addWikidataNames(organisms);
  if (isWanted("met")) {
    store("met", toMuseumImport(await collectMetMatches(namedOrganisms), metMuseum));
  }
  if (isWanted("cleveland")) {
    store(
      "cleveland",
      toMuseumImport(await collectClevelandMatches(namedOrganisms), clevelandMuseum),
    );
  }
}

function loadOrganisms() {
  const rows = queryD1<{ id: string; label: string }>(
    "SELECT id, label FROM nodes WHERE kind = 'organism' ORDER BY id",
  );
  const names = queryD1<{ node_id: string; name: string }>(
    `SELECT node_names.node_id, node_names.name FROM node_names
     JOIN nodes ON nodes.id = node_names.node_id
     WHERE nodes.kind = 'organism' AND (node_names.language = 'en' OR node_names.language LIKE 'en-%')`,
  );
  const namesByNodeId = Map.groupBy(names, ({ node_id }) => node_id);
  return rows.map(({ id, label }) => ({
    id,
    label,
    englishNames: (namesByNodeId.get(id) ?? []).map(({ name }) => name),
    ancestors: [],
  })) satisfies MuseumOrganism[];
}

function store(
  source: string,
  { nodes, connections }: { nodes: NodeDraft[]; connections: ConnectionDraft[] },
) {
  writeConnectionImport(source, nodes, connections);
  console.log(`${source}: stored ${connections.length} connections and ${nodes.length} nodes.`);
}
