import type { GraphNode } from "../shared/graph";

/** Returns the node's first name in the given language, falling back to its label. */
export function nodeDisplayName(node: GraphNode, language: string) {
  return node.names.find((name) => name.language === language)?.name ?? node.label;
}
