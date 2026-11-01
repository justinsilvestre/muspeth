import type { TaxonTreeNode } from "./buildTaxonTree";

/** Lists the tree as nested lists, for screen readers. */
export function TaxonTreeOutline({ tree }: { tree: TaxonTreeNode }) {
  return (
    <ul aria-label="Taxonomic tree outline" className="sr-only">
      <TaxonTreeOutlineItem node={tree} />
    </ul>
  );
}

function TaxonTreeOutlineItem({ node }: { node: TaxonTreeNode }) {
  // An organism named by its taxon is already announced by the taxon's own item.
  const listedChildren = node.children.filter((child) => !child.isNamedByTaxon);
  return (
    <li>
      {describeNode(node)}
      {listedChildren.length > 0 && (
        <ul>
          {listedChildren.map((child) => (
            <TaxonTreeOutlineItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function describeNode({ rank, label, isPlacementUncertain }: TaxonTreeNode) {
  if (rank === "root") return label;
  if (rank !== "organism") return `${rank} ${label}`;
  return isPlacementUncertain ? `${label} (placement uncertain)` : label;
}
