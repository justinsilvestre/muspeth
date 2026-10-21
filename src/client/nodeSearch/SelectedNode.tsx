import type { GraphNode } from "../../shared/graph";
import type { NodeCatalog } from "./createNodeCatalog";
import { NodeSummary } from "./NodeSummary";

/** Shows which node's connections are open. */
export function SelectedNode({ node, catalog }: { node: GraphNode; catalog: NodeCatalog }) {
  return (
    <div className="rounded border border-line bg-panel px-3 py-2">
      <p className="text-muted text-sm">Selected</p>
      <p className="font-medium">
        <NodeSummary node={node} isNameShared={catalog.sharedNameNodeIds.has(node.id)} />
      </p>
    </div>
  );
}
