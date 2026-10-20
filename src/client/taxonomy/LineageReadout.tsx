import clsx from "clsx";
import type { TaxonTreeNode } from "./buildTaxonTree";

/** Lists the pointed-at lineage from kingdom down in a fixed corner of the view, where no label can hide it. */
export function LineageReadout({ lineage }: { lineage: TaxonTreeNode[] }) {
  if (lineage.length === 0) return null;

  return (
    <ol className="pointer-events-none absolute bottom-2 left-2 select-none rounded border border-line bg-page/85 px-2.5 py-1.5 text-xs backdrop-blur">
      {lineage.map((node) => (
        <li key={node.id} className="flex gap-2">
          <span className="w-14 shrink-0 text-faint">
            {node.rank === "organism" ? "" : node.rank}
          </span>
          <span
            className={clsx(
              node.rank === "organism" ? "font-medium text-ink" : "text-muted",
              node.isPlacementUncertain && "text-amber-700 italic dark:text-amber-400",
            )}
          >
            {node.label}
            {node.isPlacementUncertain && " ?"}
          </span>
        </li>
      ))}
    </ol>
  );
}
