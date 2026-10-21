import clsx from "clsx";
import type { NodeMedia } from "../../shared/graph";
import { describeMediaCredit } from "../media/MediaCredit";
import { resizeCommonsImage } from "../media/resizeCommonsImage";
import type { TaxonTreeNode } from "./buildTaxonTree";
import { listRepeatedTaxonIds } from "./listRepeatedTaxonIds";

/**
 * Lists the pointed-at lineage from kingdom down in a fixed corner of the view, where no label can hide it.
 * An organism named by its taxon takes the taxon's line, and an organism's image, when it has one, sits above.
 */
export function LineageReadout({ lineage }: { lineage: TaxonTreeNode[] }) {
  if (lineage.length === 0) return null;
  const repeatedTaxonIds = listRepeatedTaxonIds(lineage);
  const organism = lineage.at(-1);

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 select-none rounded border border-line bg-page/85 px-2.5 py-1.5 text-xs backdrop-blur">
      {organism?.media && <OrganismImage media={organism.media} name={organism.label} />}
      <ol>
        {lineage.map((node, index) => {
          if (repeatedTaxonIds.has(node.id)) return null;
          return (
            <li key={node.id} className="flex gap-2">
              <span className="w-14 shrink-0 text-faint">
                {describeRank(node, lineage[index - 1])}
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
          );
        })}
      </ol>
    </div>
  );
}

/** Shows an organism's image with a plain-text credit, since the readout cannot take the pointer to follow links. */
function OrganismImage({ media, name }: { media: NodeMedia; name: string }) {
  return (
    <figure className="mb-1.5 w-32">
      <img
        src={resizeCommonsImage(media.url, 330)}
        alt={name}
        className="aspect-square w-full rounded bg-subtle object-cover"
      />
      <figcaption className="mt-0.5 line-clamp-2 break-words text-[0.65rem] text-faint">
        {describeMediaCredit(media)}
      </figcaption>
    </figure>
  );
}

/** Returns the rank to show beside a node: an organism has none of its own unless its taxon names it. */
function describeRank(node: TaxonTreeNode, parent: TaxonTreeNode | undefined) {
  if (node.isNamedByTaxon) return parent?.rank;
  return node.rank === "organism" ? "" : node.rank;
}
