import { useState } from "react";
import type { GraphNode } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";
import { NodeList } from "./NodeList";
import { useApiResource } from "./useApiResource";

export function App() {
  const nodesResource = useApiResource<{ nodes: GraphNode[] }>("/api/nodes");
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  return (
    <main className="mx-auto max-w-4xl p-6 font-sans text-stone-900">
      <h1 className="mb-6 font-semibold text-2xl">Multispecies ethnography</h1>
      {nodesResource.status === "loading" && <p>Loading organisms…</p>}
      {nodesResource.status === "failed" && (
        <p role="alert">Could not load organisms: {nodesResource.error.message}</p>
      )}
      {nodesResource.status === "loaded" && (
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
    </main>
  );
}
