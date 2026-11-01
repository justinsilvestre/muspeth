/**
 * Loads whole Mangal networks that hold one of the seed's organisms, plus the pinned networks,
 * within fixed bounds. Each network's organisms become nodes, shared with the nodes that other
 * imports added for the same organisms. Copies of a network are recorded, not loaded twice.
 * Re-running it replaces the connections, organisms and copies of the previous run.
 * Usage: npm run db:import-networks
 */
import { executeSqlScript, queryDatabase } from "./database.ts";
import { loadOrganismIdsByLabel } from "./loadOrganismIdsByLabel.ts";
import { fetchNetworkContent, fetchNetworkIdsOfTaxon } from "./mangalApi.ts";
import { type MangalNetworkContent, toNetworkConnections } from "./mangalConnections.ts";
import { chooseCanonical, groupCopies } from "./mangalNetworkCopies.ts";
import { listNetworkCopies } from "./mangalNetworkProvenance.ts";
import { selectNetworks } from "./mangalNetworkSelection.ts";
import { identifyMangalNodes, toMangalNodeDrafts } from "./mangalNodeDrafts.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { toNetworkCopiesSql } from "./networkCopiesSql.ts";
import { seedOrganismsSql } from "./seedOrganismsSql.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "mangal";
const concurrency = 4;

/**
 * Networks loaded whatever the sample's organisms and the limits:
 * Makoto Kato's two Japanese plant–pollinator surveys, at Mt. Kushigata (948) and Mt. Yufu (2462),
 * which stand in for the plan's Kyoto network since Mangal holds none from Kyoto itself;
 * and Savely's four food webs of rotting oak and pine logs in Duke Forest (1494 to 1497), one
 * assemblage of fungus feeders, predators, parasites and scavengers at two stages of decay.
 */
const pinnedNetworkIds = [948, 2462, 1494, 1495, 1496, 1497];

/** Networks larger than this are left out, since one site's network is wanted, not a whole region's. */
const maxNetworkInteractionCount = 1000;
const limits = { networkCount: 30, interactionCount: 4000, networksPerDataset: 5 };

const seedNames = queryDatabase<{ label: string }>(seedOrganismsSql).map(({ label }) => label);
const existingIdByName = loadOrganismIdsByLabel([source]);

const candidateIds = new Set(pinnedNetworkIds);
for (const name of seedNames) {
  for (const id of await fetchNetworkIdsOfTaxon(name)) candidateIds.add(id);
}
const contents = (
  await mapConcurrently(
    [...candidateIds],
    (id) => fetchNetworkContent(id, maxNetworkInteractionCount),
    concurrency,
  )
).filter((content) => content !== null);
const groups = groupCopies(contents).map((group) => ({ group, canonical: chooseCanonical(group) }));
const selectedIds = selectNetworks(
  groups.map(({ canonical }) => toNetworkSize(canonical)),
  pinnedNetworkIds,
  limits,
);
const selected = groups.filter(({ canonical }) => selectedIds.includes(canonical.network.id));
const networks = selected.map(({ canonical }) => canonical);

const allNodes = networks.flatMap(({ nodes }) => nodes);
const { identities, choices } = await identifyMangalNodes(allNodes, existingIdByName);
const connections = networks.flatMap((content) => toNetworkConnections(content, identities));
const connectedIds = new Set(connections.flatMap((c) => [c.sourceNodeId, c.targetNodeId]));
const nodes = toMangalNodeDrafts(allNodes, identities, choices, connectedIds);
const copies = selected.flatMap(({ canonical, group }) => listNetworkCopies(canonical, group));

writeConnectionImport(source, nodes, connections);
executeSqlScript(toNetworkCopiesSql(source, copies));
console.log(
  `Stored ${connections.length} connections among ${new Set(nodes.map(({ id }) => id)).size} organisms from ${networks.length} of ${contents.length} candidate networks, with ${copies.length} copies recorded.`,
);

function toNetworkSize({ network, interactions }: MangalNetworkContent) {
  return { id: network.id, datasetId: network.datasetId, interactionCount: interactions.length };
}
