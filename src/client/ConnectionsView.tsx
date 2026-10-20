import { useParams } from "react-router";
import type { GraphNode } from "../shared/graph";
import { ConnectionList } from "./ConnectionList";
import { NodeList } from "./NodeList";

/** Lists the organisms, with the connections of the one named in the address, if any. */
export function ConnectionsView({ nodes }: { nodes: GraphNode[] }) {
  const { nodeId } = useParams();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <NodeList nodes={nodes} selectedNodeId={nodeId} />
      {nodeId && <ConnectionList nodeId={nodeId} nodes={nodes} />}
    </div>
  );
}
