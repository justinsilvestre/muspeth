import type { GraphNode, NodeMedia } from "../../shared/graph";
import type { QualityFlag } from "../../shared/qualityFlags";
import type { Taxon, TaxonPlacement } from "../../shared/taxonomy";
import { nodeDisplayName } from "../nodeDisplayName";

/** A taxon or placed organism, with the taxa and organisms it contains. */
export type TaxonTreeNode = {
  /** An ID unique within the tree; an organism's differs from its graph node's ID, which a taxon may share. */
  id: string;
  label: string;
  /** A taxonomic rank such as "genus", or "organism" for a placed organism node. */
  rank: string;
  children: TaxonTreeNode[];
  /** Whether an organism may belong elsewhere in the tree than where it is placed. */
  isPlacementUncertain?: boolean;
  /** Whether an organism is certainly placed on a taxon of the same name, so the taxon's label can stand for both. */
  isNamedByTaxon?: boolean;
  /** An organism's image, when it has one. */
  media?: NodeMedia;
};

const rootId = "life";
const uncertainPlacementFlags = new Set<QualityFlag>([
  "higher_rank_match",
  "globi_lineage_hint",
  "fuzzy_name_match",
  "doubtful_usage",
]);

/** Assembles the taxa into one tree, with each placed organism as a leaf. */
export function buildTaxonTree(
  taxa: Taxon[],
  placements: TaxonPlacement[],
  nodes: GraphNode[],
  mediaByNodeId: Record<string, NodeMedia> = {},
) {
  const taxaByParentId = Map.groupBy(taxa, (taxon) => taxon.parentId ?? rootId);
  const placementsByTaxonId = Map.groupBy(placements, (placement) => placement.taxonId);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const toLeaf = (taxon: Taxon, { nodeId, qualityFlags }: TaxonPlacement) => {
    const node = nodesById.get(nodeId);
    const label = node ? nodeDisplayName(node, "en") : nodeId;
    const isPlacementUncertain = qualityFlags.some((flag) => uncertainPlacementFlags.has(flag));
    return {
      id: `organism:${nodeId}`,
      label,
      rank: "organism",
      children: [],
      isPlacementUncertain,
      isNamedByTaxon: label === taxon.name && !isPlacementUncertain,
      media: mediaByNodeId[nodeId],
    } satisfies TaxonTreeNode;
  };
  const toBranch = (taxon: Taxon): TaxonTreeNode => ({
    id: taxon.id,
    label: taxon.name,
    rank: taxon.rank,
    children: [
      ...(taxaByParentId.get(taxon.id) ?? []).map(toBranch),
      ...(placementsByTaxonId.get(taxon.id) ?? []).map((placement) => toLeaf(taxon, placement)),
    ],
  });

  return {
    id: rootId,
    label: "Life",
    rank: "root",
    children: (taxaByParentId.get(rootId) ?? []).map(toBranch),
  } satisfies TaxonTreeNode;
}
