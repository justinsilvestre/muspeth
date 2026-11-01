import { Route, Routes } from "react-router";
import type { GraphNode } from "../../shared/graph";
import { precomputedResponsePaths } from "../../shared/precomputedResponsePaths";
import { ColorSchemeSwitcher } from "../theme/ColorSchemeSwitcher";
import { ConnectionsView } from "./ConnectionsView";
import { KinshipsView } from "./kinships/KinshipsView";
import { NotFoundView } from "./NotFoundView";
import { PathsView } from "./paths/PathsView";
import { PlacesView } from "./places/PlacesView";
import { TaxonomyView } from "./taxonomy/TaxonomyView";
import { useApiResource } from "./useApiResource";
import { ViewNavigation } from "./ViewNavigation";

/** Shows the first version of the app, whose views are served under `/v1`. */
export function V1App() {
  const nodesResource = useApiResource<{ nodes: GraphNode[] }>(
    precomputedResponsePaths["/api/nodes"],
  );

  return (
    // A view marked to fill the screen gets the height left below the header on wide screens.
    <main className="mx-auto max-w-4xl p-6 font-sans md:has-[>[data-fills-screen]]:flex md:has-[>[data-fills-screen]]:h-dvh md:has-[>[data-fills-screen]]:flex-col md:has-[>[data-fills-screen]]:pb-0">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl">Multispecies ethnography</h1>
        <ColorSchemeSwitcher />
      </header>
      <ViewNavigation />
      {nodesResource.status === "loading" && <p>Loading organisms…</p>}
      {nodesResource.status === "failed" && (
        <p role="alert">Could not load organisms: {nodesResource.error.message}</p>
      )}
      {nodesResource.status === "loaded" && (
        <Routes>
          <Route index element={<ConnectionsView nodes={nodesResource.data.nodes} />} />
          <Route
            path="organisms/:nodeId"
            element={<ConnectionsView nodes={nodesResource.data.nodes} />}
          />
          <Route path="paths" element={<PathsView nodes={nodesResource.data.nodes} />} />
          <Route path="places" element={<PlacesView nodes={nodesResource.data.nodes} />} />
          <Route path="kinships" element={<KinshipsView nodes={nodesResource.data.nodes} />} />
          <Route path="taxonomy" element={<TaxonomyView nodes={nodesResource.data.nodes} />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      )}
    </main>
  );
}
