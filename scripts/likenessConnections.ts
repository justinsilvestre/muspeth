import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { ConnectionDraft } from "./graphDrafts.ts";
import type { TraitNeighbour } from "./traitNeighbours.ts";

/** A graph node that stands for a trait record, with the doubts that matching the two brings. */
export type TraitNode = { nodeId: string; qualityFlags: QualityFlag[] };

/** What every likeness connection computed from one trait database has in common. */
export type LikenessTemplate = Pick<
  ConnectionDraft,
  "relation" | "taxonomicLevel" | "licence" | "sources"
>;

/**
 * Links the nodes of each trait record to the nodes of its neighbours, weighted by similarity.
 * Likeness reads the same in both directions, so each pair of nodes is linked once.
 */
export function toLikenessConnections<Traits>(
  neighboursByName: Map<string, TraitNeighbour<Traits>[]>,
  nodesByName: Map<string, TraitNode[]>,
  template: LikenessTemplate,
) {
  const drafts = [...neighboursByName].flatMap(([name, neighbours]) =>
    (nodesByName.get(name) ?? []).flatMap((subject) =>
      neighbours.flatMap((neighbour) =>
        (nodesByName.get(neighbour.record.name) ?? []).map((target) =>
          toLikenessConnection(subject, target, neighbour, template),
        ),
      ),
    ),
  );
  const connections = new Map<string, ConnectionDraft>();
  for (const draft of drafts.filter(
    ({ sourceNodeId, targetNodeId }) => sourceNodeId !== targetNodeId,
  )) {
    const key = [draft.sourceNodeId, draft.targetNodeId].sort().join("\n");
    if (!connections.has(key)) connections.set(key, draft);
  }
  return [...connections.values()];
}

function toLikenessConnection<Traits>(
  subject: TraitNode,
  target: TraitNode,
  neighbour: TraitNeighbour<Traits>,
  template: LikenessTemplate,
) {
  const tieFlags = (neighbour.isTied ? ["tied_nearest_neighbour"] : []) satisfies QualityFlag[];
  return {
    ...template,
    sourceNodeId: subject.nodeId,
    targetNodeId: target.nodeId,
    kind: "likeness",
    basis: "computed",
    weight: Math.round(neighbour.similarity * 1000) / 1000,
    qualityFlags: [...new Set([...subject.qualityFlags, ...target.qualityFlags, ...tieFlags])],
  } satisfies ConnectionDraft;
}
