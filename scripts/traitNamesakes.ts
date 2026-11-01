import type { NodeDraft } from "./graphDrafts.ts";
import type { TraitNode } from "./likenessConnections.ts";

/** A trait record identified with a node: the record's name, the node, and the node's draft. */
export type IdentifiedRecord = { name: string; node: TraitNode; draft: NodeDraft };

/**
 * Gives records that resolve to the same accepted name one node, so that a genus and its synonym
 * do not become two nodes with one label: the node of the record that bears the accepted name
 * itself, or else that of the first such record.
 */
export function mergeNamesakes<Record extends IdentifiedRecord>(records: Record[]) {
  const idByLabel = new Map<string, string>();
  for (const { name, draft } of records) {
    if (name === draft.label || !idByLabel.has(draft.label)) idByLabel.set(draft.label, draft.id);
  }
  return records.map((record) => {
    const id = idByLabel.get(record.draft.label) ?? record.draft.id;
    if (id === record.draft.id) return record;
    return { ...record, node: { ...record.node, nodeId: id }, draft: { ...record.draft, id } };
  });
}
