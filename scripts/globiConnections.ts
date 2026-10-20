import type { ConnectionSource } from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { GlobiRecord } from "./globiRecords.ts";
import type { ConnectionDraft } from "./graphDrafts.ts";

/** GloBI publishes its compiled data under CC0 and asks users to cite each original dataset. */
const licence = "CC0-1.0";

/** Ranks from coarsest to finest. Ranks missing here, such as "clade", are ignored. */
const ranks = [
  "domain",
  "superkingdom",
  "kingdom",
  "subkingdom",
  "phylum",
  "subphylum",
  "superclass",
  "class",
  "subclass",
  "superorder",
  "order",
  "suborder",
  "superfamily",
  "family",
  "subfamily",
  "tribe",
  "genus",
  "subgenus",
  "species",
  "subspecies",
  "variety",
  "form",
];

/** Relations that read the same in both directions. */
const symmetricRelations = new Set([
  "symbiontOf",
  "mutualistOf",
  "commensalistOf",
  "interactsWith",
  "coOccursWith",
  "coRoostsWith",
  "adjacentTo",
  "ecologicallyRelatedTo",
]);

type OrganismIdentity = { id: string; qualityFlags: QualityFlag[] };

/** One interaction between two nodes, merged from one or more GloBI records. */
export type GlobiConnectionDraft = ConnectionDraft & {
  sources: (ConnectionSource & { recordCount: number })[];
};

/** Converts a record into a connection between the nodes its organisms were identified with. */
export function toConnectionDraft(record: GlobiRecord, identities: Map<string, OrganismIdentity>) {
  const subject = identities.get(record.subject.name);
  const object = identities.get(record.object.name);
  if (!subject || !object) throw new Error(`Unidentified organism in ${JSON.stringify(record)}`);
  return {
    sourceNodeId: subject.id,
    targetNodeId: object.id,
    kind: "interaction",
    relation: record.relation,
    basis: "observed",
    taxonomicLevel: toCoarserRank(record.subject.rank, record.object.rank),
    licence,
    sources: [
      {
        datasetId: record.datasetId,
        datasetCitation: record.datasetCitation,
        studyCitation: record.studyCitation,
        studyUrl: record.studyUrl,
        recordCount: 1,
      },
    ],
    qualityFlags: [...new Set([...subject.qualityFlags, ...object.qualityFlags])],
  } satisfies GlobiConnectionDraft;
}

function toCoarserRank(first: string | null, second: string | null) {
  const known = [first, second].filter((rank) => rank !== null && ranks.includes(rank));
  return known.sort((a, b) => ranks.indexOf(a ?? "") - ranks.indexOf(b ?? ""))[0] ?? null;
}

/**
 * Merges drafts of the same interaction between the same two nodes, keeping every study and flag,
 * and drops links from a node to itself.
 */
export function mergeConnections(drafts: GlobiConnectionDraft[]) {
  const merged = new Map<string, GlobiConnectionDraft>();
  for (const draft of drafts) {
    if (draft.sourceNodeId === draft.targetNodeId) continue;
    const key = toInteractionKey(draft);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeDraftPair(existing, draft) : draft);
  }
  return [...merged.values()];
}

function toInteractionKey({ sourceNodeId, targetNodeId, relation }: GlobiConnectionDraft) {
  const nodeIds = [sourceNodeId, targetNodeId];
  if (symmetricRelations.has(relation)) nodeIds.sort();
  return [relation, ...nodeIds].join("\n");
}

function mergeDraftPair(first: GlobiConnectionDraft, second: GlobiConnectionDraft) {
  return {
    ...first,
    taxonomicLevel: toCoarserRank(first.taxonomicLevel, second.taxonomicLevel),
    sources: mergeSources([...first.sources, ...second.sources]),
    qualityFlags: [...new Set([...first.qualityFlags, ...second.qualityFlags])],
  } satisfies GlobiConnectionDraft;
}

/** Merges the records of each study within each dataset, adding up their counts. */
function mergeSources(sources: GlobiConnectionDraft["sources"]) {
  const merged = new Map<string, GlobiConnectionDraft["sources"][number]>();
  for (const source of sources) {
    const key = JSON.stringify([source.datasetId, source.studyCitation, source.studyUrl]);
    const existing = merged.get(key);
    merged.set(
      key,
      existing ? { ...existing, recordCount: existing.recordCount + source.recordCount } : source,
    );
  }
  return [...merged.values()];
}
