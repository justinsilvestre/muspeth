import type { ConnectionSource } from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import { toCoarserRank } from "./globiConnections.ts";
import type { ConnectionDraft } from "./graphDrafts.ts";
import { toLatitudeLongitude } from "./mangalGeometry.ts";
import {
  readSourceCollection,
  toNetworkLicence,
  toNetworkSource,
  toWebOfLifeSource,
} from "./mangalNetworkSources.ts";
import { readWebOfLifeId } from "./mangalOrganisms.ts";
import type {
  MangalDataset,
  MangalInteraction,
  MangalNetwork,
  MangalNode,
  MangalReference,
} from "./mangalRecords.ts";

/**
 * Names Mangal's interaction types as the OBO Relation Ontology does, as GloBI's links are named,
 * where the ontology has an exact equivalent. Other types keep Mangal's name.
 */
const relationByType: Record<string, string> = {
  predation: "preysOn",
  herbivory: "eats",
  parasitism: "parasiteOf",
  mutualism: "mutualistOf",
  commensalism: "commensalistOf",
  symbiosis: "symbiontOf",
  unspecified: "interactsWith",
};

/** Matches attributes whose value only records that an interaction was seen. */
const presenceOnlyPattern = /presence|absence|present or absent/i;

/** The fetched content of one Mangal network. */
export type MangalNetworkContent = {
  network: MangalNetwork;
  dataset: MangalDataset | null;
  reference: MangalReference | null;
  nodes: MangalNode[];
  interactions: MangalInteraction[];
};

export type MangalNodeIdentity = { id: string; rank: string | null; qualityFlags: QualityFlag[] };

type MangalConnectionDraft = Omit<ConnectionDraft, "sources"> & {
  sources: (ConnectionSource & { recordCount: number })[];
};
type NetworkContext = ReturnType<typeof toNetworkContext>;

/**
 * Converts a network's interactions into connections between the nodes its organisms were
 * identified with, merging repeated links. Mangal records links from consumer to resource,
 * as GloBI's are oriented, so their direction is kept.
 */
export function toNetworkConnections(
  content: MangalNetworkContent,
  identities: Map<number, MangalNodeIdentity>,
) {
  const context = toNetworkContext(content);
  const drafts = content.interactions.flatMap((interaction) =>
    toConnectionDrafts(interaction, identities, context),
  );
  return mergeNetworkConnections(drafts);
}

function toNetworkContext({ network, dataset, reference, nodes }: MangalNetworkContent) {
  const collection = readSourceCollection(reference);
  return {
    network,
    place: network.description || network.name,
    ...(network.geometry ? toLatitudeLongitude(network.geometry) : {}),
    licence: toNetworkLicence(reference),
    sources: [
      toNetworkSource(network, dataset, reference),
      ...(collection === "web-of-life"
        ? [toWebOfLifeSource(findWebOfLifeId(nodes), reference)]
        : []),
    ],
    qualityFlags: collection ? (["duplicate_network_copy"] satisfies QualityFlag[]) : [],
  };
}

function findWebOfLifeId(nodes: MangalNode[]) {
  return nodes.map(({ originalName }) => readWebOfLifeId(originalName)).find(Boolean) ?? null;
}

function toConnectionDrafts(
  interaction: MangalInteraction,
  identities: Map<number, MangalNodeIdentity>,
  context: NetworkContext,
): MangalConnectionDraft[] {
  const from = identities.get(interaction.nodeFrom);
  const to = identities.get(interaction.nodeTo);
  if (!from || !to) return [];
  const isCollapsed = from.id === to.id && interaction.nodeFrom !== interaction.nodeTo;
  const flags = [
    ...context.qualityFlags,
    ...from.qualityFlags,
    ...to.qualityFlags,
    ...(isCollapsed ? (["suspected_error"] satisfies QualityFlag[]) : []),
  ];
  return [
    {
      sourceNodeId: from.id,
      targetNodeId: to.id,
      kind: "interaction",
      relation: relationByType[interaction.type] ?? interaction.type,
      basis: "observed",
      taxonomicLevel: from.rank && to.rank ? toCoarserRank(from.rank, to.rank) : null,
      weight: toWeight(interaction),
      place: context.place,
      latitude: context.latitude ?? null,
      longitude: context.longitude ?? null,
      date: interaction.date ?? context.network.date,
      licence: context.licence,
      qualityFlags: [...new Set(flags)],
      sources: context.sources.map((source) => ({ ...source, recordCount: 1 })),
    },
  ];
}

function toWeight({ value, attribute }: MangalInteraction) {
  return attribute && !presenceOnlyPattern.test(attribute) ? value : null;
}

/** Merges repeated links between the same two nodes, adding up their weights and records. */
export function mergeNetworkConnections(drafts: MangalConnectionDraft[]) {
  const merged = new Map<string, MangalConnectionDraft>();
  for (const draft of drafts) {
    const key = [draft.relation, draft.sourceNodeId, draft.targetNodeId].join("\n");
    const existing = merged.get(key);
    merged.set(key, existing ? mergeDraftPair(existing, draft) : draft);
  }
  return [...merged.values()];
}

function mergeDraftPair(first: MangalConnectionDraft, second: MangalConnectionDraft) {
  const hasWeights = typeof first.weight === "number" && typeof second.weight === "number";
  return {
    ...first,
    weight: hasWeights ? (first.weight ?? 0) + (second.weight ?? 0) : null,
    date: toDateRange(first.date ?? null, second.date ?? null),
    qualityFlags: [...new Set([...first.qualityFlags, ...second.qualityFlags])],
    sources: first.sources.map((source, i) => ({
      ...source,
      recordCount: source.recordCount + (second.sources[i]?.recordCount ?? 0),
    })),
  } satisfies MangalConnectionDraft;
}

/** Gives the interval spanned by two dates or intervals, or the one date they share. */
export function toDateRange(first: string | null, second: string | null) {
  const days = [first, second].flatMap((date) => date?.split("/") ?? []).sort();
  const [start, end] = [days[0], days.at(-1)];
  if (!start || !end) return null;
  return start === end ? start : `${start}/${end}`;
}
