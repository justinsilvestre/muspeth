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
  return (
    <li>
      {node.rank === "organism" || node.rank === "root" ? node.label : `${node.rank} ${node.label}`}
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TaxonTreeOutlineItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
