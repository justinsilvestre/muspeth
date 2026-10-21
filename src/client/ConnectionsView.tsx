import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import type { GraphNode } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";
import { useConnectionFilter } from "./filters/useConnectionFilter";
import { NodeSearch } from "./nodeSearch/NodeSearch";
import { useNodeCatalog } from "./nodeSearch/useNodeCatalog";
import { ScrollColumn } from "./ScrollColumn";

/**
 * Searches the nodes, and shows the connections of the one named in the address, if any.
 * On wide screens it fills the screen below the page header, and each column scrolls on its own,
 * so that the node search keeps its place while the connections beside it change.
 */
export function ConnectionsView({ nodes }: { nodes: GraphNode[] }) {
  const { nodeId } = useParams();
  const { filterResult, setFilter } = useConnectionFilter();
  const catalog = useNodeCatalog(nodes);
  const connectionsColumnRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: each node's connections start from the top.
  useEffect(() => {
    if (connectionsColumnRef.current) connectionsColumnRef.current.scrollTop = 0;
  }, [nodeId]);

  return (
    // The connections come first, so that narrow screens and screen readers reach them before the node search.
    <div
      data-fills-screen
      className="grid gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] [&>*]:min-w-0"
    >
      {nodeId && !filterResult.ok && (
        <p role="alert">Could not read the filters in this address: {filterResult.error}</p>
      )}
      {nodeId && filterResult.ok && (
        <ScrollColumn ref={connectionsColumnRef}>
          <ConnectionList
            nodeId={nodeId}
            nodes={nodes}
            filter={filterResult.value}
            onFilterChange={setFilter}
          />
        </ScrollColumn>
      )}
      <ScrollColumn className="md:order-first">
        <NodeSearch catalog={catalog} selectedNodeId={nodeId} />
      </ScrollColumn>
    </div>
  );
}
