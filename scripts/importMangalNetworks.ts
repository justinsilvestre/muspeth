/**
 * Loads whole Mangal networks that hold one of the seed's organisms, plus the pinned networks,
 * within fixed bounds. Each network's organisms become nodes, shared with the nodes that other
 * imports added for the same organisms. Copies of a network are recorded, not loaded twice.
 * Re-running it replaces the connections, organisms and copies of the previous run.
 * Usage: npm run db:import-networks -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { executeD1Script, queryD1 } from "./d1.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import { fetchNetworkContent, fetchNetworkIdsOfTaxon } from "./mangalApi.ts";
import {
  type MangalNetworkContent,
  type MangalNodeIdentity,
  toNetworkConnections,
} from "./mangalConnections.ts";
import { chooseCanonical, groupCopies } from "./mangalNetworkCopies.ts";
import { listNetworkCopies } from "./mangalNetworkProvenance.ts";
import { selectNetworks } from "./mangalNetworkSelection.ts";
import { identifyMangalNode, listMangalNodeNames, toLookupName } from "./mangalOrganisms.ts";
import type { MangalNode } from "./mangalRecords.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { toNetworkCopiesSql } from "./networkCopiesSql.ts";
import { seedOrganismsSql } from "./seedOrganismsSql.ts";
import { chooseWikidataTaxa } from "./wikidataChoices.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "mangal";
const concurrency = 4;

/**
 * Makoto Kato's two Japanese plant–pollinator surveys, at Mt. Kushigata (948) and Mt. Yufu (2462).
 * Mangal holds no network from Kyoto itself, so these stand in for the plan's Kyoto network.
 */
const pinnedNetworkIds = [948, 2462];

/** Networks larger than this are left out, since one site's network is wanted, not a whole region's. */
const maxNetworkInteractionCount = 1000;
const limits = { networkCount: 30, interactionCount: 4000, networksPerDataset: 5 };

const seedNames = queryD1<{ label: string }>(seedOrganismsSql).map(({ label }) => label);
const existingOrganisms = queryD1<{ id: string; label: string }>(
  `SELECT id, label FROM nodes WHERE kind = 'organism' AND source <> '${source}'`,
);
const existingIdByName = new Map(existingOrganisms.map(({ id, label }) => [label, id]));

const candidateIds = new Set(pinnedNetworkIds);
for (const name of seedNames) {
  for (const id of await fetchNetworkIdsOfTaxon(name)) candidateIds.add(id);
}
const contents = (
  await mapConcurrently([...candidateIds], concurrency, (id) =>
    fetchNetworkContent(id, maxNetworkInteractionCount),
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
const choices = await chooseWikidataTaxa(listLookupNames(allNodes), listLinkedIdsByName(allNodes));
const identities = new Map(
  allNodes.map((node) => {
    const choice = choices.get(toLookupName(node) ?? "") ?? null;
    return [node.id, identifyMangalNode(node, choice, existingIdByName)] as const;
  }),
);
const connections = networks.flatMap((content) => toNetworkConnections(content, identities));
const connectedIds = new Set(connections.flatMap((c) => [c.sourceNodeId, c.targetNodeId]));
const nodes = allNodes.flatMap((node) => toNodeDraft(node, identities.get(node.id), connectedIds));
const copies = selected.flatMap(({ canonical, group }) => listNetworkCopies(canonical, group));

writeConnectionImport(source, nodes, connections);
executeD1Script(toNetworkCopiesSql(source, copies));
console.log(
  `Stored ${connections.length} connections among ${new Set(nodes.map(({ id }) => id)).size} organisms from ${networks.length} of ${contents.length} candidate networks, with ${copies.length} copies recorded.`,
);

function toNetworkSize({ network, interactions }: MangalNetworkContent) {
  return { id: network.id, datasetId: network.datasetId, interactionCount: interactions.length };
}

function listLookupNames(mangalNodes: MangalNode[]) {
  const names = mangalNodes.map(toLookupName).filter((name) => name !== null);
  return [...new Set(names)].filter((name) => !existingIdByName.has(name));
}

/** Lists the GBIF and NCBI taxa that Mangal matched each name to, for choosing among namesakes. */
function listLinkedIdsByName(mangalNodes: MangalNode[]) {
  const linkedIds = new Map<string, string[]>();
  for (const node of mangalNodes) {
    const name = toLookupName(node);
    const { gbif, ncbi } = node.taxonomy ?? {};
    const ids = [gbif && `gbif:${gbif}`, ncbi && `ncbi:${ncbi}`].filter(
      (id): id is string => typeof id === "string",
    );
    if (name) linkedIds.set(name, [...(linkedIds.get(name) ?? []), ...ids]);
  }
  return linkedIds;
}

function toNodeDraft(
  node: MangalNode,
  identity: (MangalNodeIdentity & { label: string }) | undefined,
  connectedIds: Set<string>,
) {
  if (!identity || !connectedIds.has(identity.id)) return [];
  const name = toLookupName(node) ?? identity.label;
  const names = listMangalNodeNames(name, choices.get(name) ?? null);
  return [{ id: identity.id, kind: "organism", label: identity.label, names } satisfies NodeDraft];
}
