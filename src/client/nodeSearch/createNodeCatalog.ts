import type { GraphNode } from "../../shared/graph";
import { countNodesByKind } from "./countNodesByKind";
import { findNodesWithSharedNames } from "./findNodesWithSharedNames";
import { listKindExamples } from "./listKindExamples";
import { createNodeSearchIndex } from "./searchNodes";

/** Nodes offered before anything is searched: the organisms of the hand-entered seed sample. */
const startingPointIds = [
  "wikidata:Q509308", // matsutake
  "wikidata:Q1044186", // Japanese red pine
  "wikidata:Q1197786", // pinewood nematode
  "wikidata:Q15859794", // Japanese pine sawyer
  "wikidata:Q30034", // western honey bee
];

/** How many example nodes to offer for each kind before anything is searched. */
const exampleCountPerKind = 3;

/** Prepares the nodes for searching, naming and choosing. */
export function createNodeCatalog(nodes: GraphNode[]) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const startingPoints = startingPointIds.flatMap((id) => nodesById.get(id) ?? []);
  return {
    nodes,
    nodesById,
    searchIndex: createNodeSearchIndex(nodes),
    sharedNameNodeIds: findNodesWithSharedNames(nodes),
    startingPoints,
    nodeCountsByKind: countNodesByKind(nodes),
    examplesByKind: listKindExamples(nodes, startingPoints, exampleCountPerKind),
  };
}

export type NodeCatalog = ReturnType<typeof createNodeCatalog>;
