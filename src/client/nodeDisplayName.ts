import type { GraphNode } from "../shared/graph";

/** Returns the node's first name in the given language, falling back to its label. */
export function nodeDisplayName(node: GraphNode, language: string) {
  return findName(node, language) ?? node.label;
}

/** Returns the node's first name in the given language, unless that name only repeats its label. */
export function findDistinctName(node: GraphNode, language: string) {
  const name = findName(node, language);
  return name === node.label ? undefined : name;
}

function findName(node: GraphNode, language: string) {
  return node.names.find((name) => name.language === language)?.name;
}
