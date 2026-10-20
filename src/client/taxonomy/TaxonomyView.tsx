import { lazy, Suspense } from "react";
import type { GraphNode } from "../../shared/graph";
import type { Taxon, TaxonPlacement } from "../../shared/taxonomy";
import { useApiResource } from "../useApiResource";
import { buildTaxonTree } from "./buildTaxonTree";
import { TaxonTreeOutline } from "./TaxonTreeOutline";

const TaxonTreeScene = lazy(() => import("./TaxonTreeScene"));

export function TaxonomyView({ nodes }: { nodes: GraphNode[] }) {
  const resource = useApiResource<{ taxa: Taxon[]; placements: TaxonPlacement[] }>("/api/taxonomy");

  return (
    <section aria-labelledby="taxonomy-heading">
      <h2 id="taxonomy-heading" className="mb-1 font-medium text-lg">
        Taxonomic tree
      </h2>
      <p className="mb-3 text-sm text-stone-600">
        Lineages from the GBIF backbone taxonomy (CC BY 4.0). Drag to turn the tree; scroll to zoom.
      </p>
      {resource.status === "loading" && <p>Loading the taxonomy…</p>}
      {resource.status === "failed" && (
        <p role="alert">Could not load the taxonomy: {resource.error.message}</p>
      )}
      {resource.status === "loaded" && (
        <TaxonomyTree tree={buildTaxonTree(resource.data.taxa, resource.data.placements, nodes)} />
      )}
    </section>
  );
}

function TaxonomyTree({ tree }: { tree: ReturnType<typeof buildTaxonTree> }) {
  return (
    <>
      <div aria-hidden="true" className="h-[70vh] rounded border border-stone-200 bg-stone-50">
        <Suspense fallback={<p className="p-3">Loading the tree…</p>}>
          <TaxonTreeScene tree={tree} />
        </Suspense>
      </div>
      <TaxonTreeOutline tree={tree} />
    </>
  );
}
