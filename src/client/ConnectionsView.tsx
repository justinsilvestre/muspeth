import { useParams } from "react-router";
import type { GraphNode } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";
import { useConnectionFilter } from "./filters/useConnectionFilter";
import { NodeSearch } from "./nodeSearch/NodeSearch";
import { useNodeCatalog } from "./nodeSearch/useNodeCatalog";

/** Searches the nodes, and shows the connections of the one named in the address, if any. */
export function ConnectionsView({ nodes }: { nodes: GraphNode[] }) {
  const { nodeId } = useParams();
  const { filterResult, setFilter } = useConnectionFilter();
  const catalog = useNodeCatalog(nodes);

  return (
    // The connections come first, so that narrow screens and screen readers reach them before the node search.
    <div className="grid gap-6 md:grid-cols-2 [&>*]:min-w-0">
      {nodeId && !filterResult.ok && (
        <p role="alert">Could not read the filters in this address: {filterResult.error}</p>
      )}
      {nodeId && filterResult.ok && (
        <ConnectionList
          nodeId={nodeId}
          nodes={nodes}
          filter={filterResult.value}
          onFilterChange={setFilter}
        />
      )}
      <div className="md:order-first">
        <NodeSearch catalog={catalog} selectedNodeId={nodeId} />
      </div>
    </div>
  );
}
