import { useState } from "react";
import type { GraphNode } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";
import { NodeList } from "./NodeList";
import { TaxonomyView } from "./taxonomy/TaxonomyView";
import { ColorSchemeSwitcher } from "./theme/ColorSchemeSwitcher";
import { useApiResource } from "./useApiResource";
import { type View, ViewSwitcher } from "./ViewSwitcher";

export function App() {
  const nodesResource = useApiResource<{ nodes: GraphNode[] }>("/api/nodes");
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [view, setView] = useState<View>("connections");

  return (
    <main className="mx-auto max-w-4xl p-6 font-sans">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl">Multispecies ethnography</h1>
        <ColorSchemeSwitcher />
      </header>
      <ViewSwitcher view={view} onChange={setView} />
      {nodesResource.status === "loading" && <p>Loading organisms…</p>}
      {nodesResource.status === "failed" && (
        <p role="alert">Could not load organisms: {nodesResource.error.message}</p>
      )}
      {nodesResource.status === "loaded" && view === "connections" && (
        <div className="grid gap-6 md:grid-cols-2">
          <NodeList
            nodes={nodesResource.data.nodes}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
          {selectedNodeId && (
            <ConnectionList nodeId={selectedNodeId} nodes={nodesResource.data.nodes} />
          )}
        </div>
      )}
      {nodesResource.status === "loaded" && view === "taxonomy" && (
        <TaxonomyView nodes={nodesResource.data.nodes} />
      )}
    </main>
  );
}
