import type { MangalNetworkContent } from "./mangalConnections.ts";
import type { MangalInteraction, MangalNode } from "./mangalRecords.ts";

/**
 * Cuts a food web down to the nodes that matter most under each of its interaction types: for
 * each type, the `perSide` nodes with the most links of that type as consumers and the `perSide`
 * with the most as resources, together with the nodes named in `pinnedNames`. Only the links
 * among the kept nodes are kept, so that every type of link stays represented.
 */
export function selectFoodWebSubset(
  content: MangalNetworkContent,
  perSide: number,
  pinnedNames: string[],
) {
  const keptIds = new Set(
    content.nodes
      .filter(({ originalName }) => pinnedNames.includes(originalName))
      .map(({ id }) => id),
  );
  for (const type of listTypes(content.interactions)) {
    const ofType = content.interactions.filter((interaction) => interaction.type === type);
    for (const side of ["nodeFrom", "nodeTo"] as const) {
      for (const id of rankBySide(ofType, side).slice(0, perSide)) keptIds.add(id);
    }
  }
  return {
    ...content,
    nodes: content.nodes.filter(({ id }) => keptIds.has(id)),
    interactions: content.interactions.filter(
      ({ nodeFrom, nodeTo }) => keptIds.has(nodeFrom) && keptIds.has(nodeTo),
    ),
  } satisfies MangalNetworkContent;
}

function listTypes(interactions: MangalInteraction[]) {
  return [...new Set(interactions.map(({ type }) => type))].sort();
}

/** Orders the nodes on one side of the links by how many links they have there, most first. */
function rankBySide(interactions: MangalInteraction[], side: "nodeFrom" | "nodeTo") {
  const counts = new Map<MangalNode["id"], number>();
  for (const interaction of interactions) {
    const id = interaction[side];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts]
    .sort(([idA, countA], [idB, countB]) => countB - countA || idA - idB)
    .map(([id]) => id);
}
