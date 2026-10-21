import { useMemo } from "react";
import type { GraphNode } from "../../shared/graph";
import { createNodeCatalog } from "./createNodeCatalog";

/** Prepares the nodes for searching once, and again only when they change. */
export function useNodeCatalog(nodes: GraphNode[]) {
  return useMemo(() => createNodeCatalog(nodes), [nodes]);
}
