import { fetchGbifSynonymNames } from "./gbifSpeciesApi.ts";
import type { GraphOrganism } from "./graphOrganismTaxa.ts";
import { type TraitNode, toLikenessConnections } from "./likenessConnections.ts";
import { identifyNewTraitOrganisms } from "./newTraitOrganisms.ts";
import type { TraitDatabase } from "./traitDatabases.ts";
import { findTraitName } from "./traitNameMatches.ts";
import { selectTraitNeighbours } from "./traitNeighbours.ts";
import { userAgent } from "./userAgent.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const headers = { "user-agent": userAgent };

/**
 * Links each graph organism that a trait database describes to its nearest neighbours in trait
 * space, adding as nodes the neighbours that the graph does not hold yet.
 * It replaces what the previous run stored for the same database.
 */
export async function importLikeness<Traits>(
  database: TraitDatabase<Traits>,
  organisms: GraphOrganism[],
  existingIdByLabel: Map<string, string>,
) {
  const records = await downloadRecords(database);
  const graphNodesByName = await matchGraphOrganisms(database, organisms, records);
  const neighboursByName = new Map(
    records
      .filter(({ name }) => graphNodesByName.has(name))
      .map((record) => [
        record.name,
        selectTraitNeighbours(record, records, database.compare, (name) =>
          graphNodesByName.has(name),
        ),
      ]),
  );
  const newRecords = [...neighboursByName.values()]
    .flat()
    .map(({ record }) => record)
    .filter(({ name }) => !graphNodesByName.has(name));
  const uniqueNewRecords = [...new Map(newRecords.map((record) => [record.name, record])).values()];
  const added = await identifyNewTraitOrganisms(
    database.source,
    uniqueNewRecords,
    existingIdByLabel,
  );
  const nodesByName = new Map([...graphNodesByName, ...added.nodesByName]);
  const connections = toLikenessConnections(neighboursByName, nodesByName, database.template);
  writeConnectionImport(database.source, added.drafts, connections);
  console.log(
    `${database.source}: ${graphNodesByName.size} records match the graph; stored ${connections.length} connections and ${added.drafts.length} added organisms.`,
  );
}

async function downloadRecords<Traits>({ tables }: TraitDatabase<Traits>) {
  const parsedTables = await Promise.all(
    tables.map(async ({ url, encoding, parse }) => {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`${url} responded ${response.status}`);
      return parse(new TextDecoder(encoding).decode(await response.arrayBuffer()));
    }),
  );
  return parsedTables.flat();
}

/** Groups the graph's organisms under the names of the trait records they match. */
async function matchGraphOrganisms<Traits>(
  database: TraitDatabase<Traits>,
  organisms: GraphOrganism[],
  records: { name: string }[],
) {
  const listedNames = new Set(records.map(({ name }) => name));
  const nodesByName = new Map<string, TraitNode[]>();
  for (const organism of organisms) {
    const match = await matchGraphOrganism(database, organism, listedNames);
    if (!match) continue;
    const node = { nodeId: organism.id, qualityFlags: match.qualityFlags } satisfies TraitNode;
    nodesByName.set(match.name, [...(nodesByName.get(match.name) ?? []), node]);
  }
  return nodesByName;
}

async function matchGraphOrganism<Traits>(
  database: TraitDatabase<Traits>,
  { label, gbif }: GraphOrganism,
  listedNames: Set<string>,
) {
  if (!gbif || !database.covers(gbif)) return null;
  const match = findTraitName(database.listNames(label, gbif), listedNames);
  if (match || !database.readsSynonyms) return match;
  const synonymNames = await fetchGbifSynonymNames(gbif.acceptedKey ?? gbif.key);
  return findTraitName(database.listNames(label, gbif, synonymNames), listedNames);
}
