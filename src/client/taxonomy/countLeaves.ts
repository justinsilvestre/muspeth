import type { TaxonTreeNode } from "./buildTaxonTree";

export function countLeaves(node: TaxonTreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((total, child) => total + countLeaves(child), 0);
}
