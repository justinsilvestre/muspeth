/** Collects the given node's ID and the IDs of all its ancestors, in order from the node up to the root. */
export function listLineageIds(parentIdsById: Map<string, string | null>, nodeId: string | null) {
  const lineageIds = new Set<string>();
  for (let id = nodeId; id !== null && id !== undefined; id = parentIdsById.get(id) ?? null) {
    lineageIds.add(id);
  }
  return lineageIds;
}
