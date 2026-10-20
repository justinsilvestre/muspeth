import { Route, Routes } from "react-router";
import type { GraphNode } from "../shared/graph";
import { ConnectionsView } from "./ConnectionsView";
import { NotFoundView } from "./NotFoundView";
import { TaxonomyView } from "./taxonomy/TaxonomyView";
import { ColorSchemeSwitcher } from "./theme/ColorSchemeSwitcher";
import { useApiResource } from "./useApiResource";
import { ViewNavigation } from "./ViewNavigation";

export function App() {
  const nodesResource = useApiResource<{ nodes: GraphNode[] }>("/api/nodes");

  return (
    <main className="mx-auto max-w-4xl p-6 font-sans">
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
          <Route path="/" element={<ConnectionsView nodes={nodesResource.data.nodes} />} />
          <Route
            path="/organisms/:nodeId"
            element={<ConnectionsView nodes={nodesResource.data.nodes} />}
          />
          <Route path="/taxonomy" element={<TaxonomyView nodes={nodesResource.data.nodes} />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      )}
    </main>
  );
}
