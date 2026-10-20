import type { GraphNode } from "../../shared/graph";
import type { Taxon, TaxonPlacement } from "../../shared/taxonomy";
import { nodeDisplayName } from "../nodeDisplayName";

/** A taxon or placed organism, with the taxa and organisms it contains. */
export type TaxonTreeNode = {
  id: string;
  label: string;
  /** A taxonomic rank such as "genus", or "organism" for a placed organism node. */
  rank: string;
  children: TaxonTreeNode[];
};

const rootId = "life";

/** Assembles the taxa into one tree, with each placed organism as a leaf. */
export function buildTaxonTree(taxa: Taxon[], placements: TaxonPlacement[], nodes: GraphNode[]) {
  const taxaByParentId = Map.groupBy(taxa, (taxon) => taxon.parentId ?? rootId);
  const placementsByTaxonId = Map.groupBy(placements, (placement) => placement.taxonId);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const toLeaf = ({ nodeId }: TaxonPlacement) => {
    const node = nodesById.get(nodeId);
    const label = node ? nodeDisplayName(node, "en") : nodeId;
    return { id: nodeId, label, rank: "organism", children: [] } satisfies TaxonTreeNode;
  };
  const toBranch = (taxon: Taxon): TaxonTreeNode => ({
    id: taxon.id,
    label: taxon.name,
    rank: taxon.rank,
    children: [
      ...(taxaByParentId.get(taxon.id) ?? []).map(toBranch),
      ...(placementsByTaxonId.get(taxon.id) ?? []).map(toLeaf),
    ],
  });

  return {
    id: rootId,
    label: "Life",
    rank: "root",
    children: (taxaByParentId.get(rootId) ?? []).map(toBranch),
  } satisfies TaxonTreeNode;
}
