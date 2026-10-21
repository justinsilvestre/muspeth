import { lazy, Suspense, useEffect, useReducer, useState } from "react";
import type { GraphNode } from "../../shared/graph";
import { precomputedResponsePaths } from "../../shared/precomputedResponsePaths";
import type { Taxon, TaxonPlacement } from "../../shared/taxonomy";
import { useApiResource } from "../useApiResource";
import { buildTaxonTree } from "./buildTaxonTree";
import { GraphicsPanel } from "./graphics/GraphicsPanel";
import {
  type GraphicsSettings,
  graphicsSettingsReducer,
  readStoredGraphicsSettings,
  storeGraphicsSettings,
} from "./graphics/graphicsSettings";
import { TaxonTreeOutline } from "./TaxonTreeOutline";

const TaxonTreeScene = lazy(() => import("./TaxonTreeScene"));

export function TaxonomyView({ nodes }: { nodes: GraphNode[] }) {
  const resource = useApiResource<{ taxa: Taxon[]; placements: TaxonPlacement[] }>(
    precomputedResponsePaths["/api/taxonomy"],
  );

  return (
    <section aria-labelledby="taxonomy-heading">
      <h2 id="taxonomy-heading" className="mb-1 font-medium text-lg">
        Taxonomic tree
      </h2>
      <p className="mb-3 text-muted text-sm">
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
  const [settings, dispatch] = useReducer(
    graphicsSettingsReducer,
    undefined,
    readStoredGraphicsSettings,
  );
  useEffect(() => storeGraphicsSettings(settings), [settings]);
  const [preview, setPreview] = useState<Partial<GraphicsSettings> | null>(null);

  return (
    <>
      <div className="relative h-[70vh] rounded border border-line bg-panel">
        <div aria-hidden="true" className="h-full">
          <Suspense fallback={<p className="p-3">Loading the tree…</p>}>
            <TaxonTreeScene tree={tree} settings={{ ...settings, ...preview }} />
          </Suspense>
        </div>
        <GraphicsPanel settings={settings} dispatch={dispatch} onPreview={setPreview} />
      </div>
      <TaxonTreeOutline tree={tree} />
    </>
  );
}
