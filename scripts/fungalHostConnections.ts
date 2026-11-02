import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { FungalHost, FungalHostRecord } from "./fungalHosts.ts";
import { toCoarserRank } from "./globiConnections.ts";
import type { ConnectionDraft } from "./graphDrafts.ts";
import type { LikenessTemplate, TraitNode } from "./likenessConnections.ts";

type Template = Pick<LikenessTemplate, "licence" | "sources">;

/**
 * Links each fungal genus to the nodes of its hosts, as interactions seen from the fungus.
 * A host that is the genus itself, or one that was not identified, is skipped, and two genera
 * that stand for the same node, such as a genus and its synonym, give one link with the flags of both.
 */
export function toFungalHostConnections(
  records: FungalHostRecord[],
  fungusNodesByName: Map<string, TraitNode[]>,
  hostNodesByName: Map<string, TraitNode[]>,
  template: Template,
) {
  const drafts = records.flatMap((record) =>
    (fungusNodesByName.get(record.genus) ?? []).flatMap((fungus) =>
      record.hosts.flatMap((host) =>
        (hostNodesByName.get(host.name) ?? [])
          .filter((hostNode) => hostNode.nodeId !== fungus.nodeId)
          .map((hostNode) => toConnection(fungus, host, hostNode, template)),
      ),
    ),
  );
  const merged = new Map<string, ConnectionDraft>();
  for (const draft of drafts) {
    const key = [draft.sourceNodeId, draft.targetNodeId, draft.relation].join("\n");
    const existing = merged.get(key);
    merged.set(key, existing ? mergeFlags(existing, draft) : draft);
  }
  return [...merged.values()];
}

function toConnection(
  fungus: TraitNode,
  host: FungalHost,
  hostNode: TraitNode,
  template: Template,
) {
  return {
    ...template,
    sourceNodeId: fungus.nodeId,
    targetNodeId: hostNode.nodeId,
    kind: "interaction",
    relation: host.relation,
    basis: "observed",
    taxonomicLevel: toCoarserRank("genus", host.rank),
    qualityFlags: uniqueFlags([
      ...fungus.qualityFlags,
      ...hostNode.qualityFlags,
      ...host.qualityFlags,
    ]),
  } satisfies ConnectionDraft;
}

function mergeFlags(first: ConnectionDraft, second: ConnectionDraft) {
  return { ...first, qualityFlags: uniqueFlags([...first.qualityFlags, ...second.qualityFlags]) };
}

function uniqueFlags(flags: QualityFlag[]) {
  return [...new Set(flags)];
}
