import type { Connection, GraphNode } from "../shared/graph";
import { ConnectionSources } from "./ConnectionSources";
import { nodeDisplayName } from "./nodeDisplayName";
import { useApiResource } from "./useApiResource";

type ConnectionListProps = {
  nodeId: string;
  nodes: GraphNode[];
};

export function ConnectionList({ nodeId, nodes }: ConnectionListProps) {
  const resource = useApiResource<{ connections: Connection[] }>(
    `/api/nodes/${encodeURIComponent(nodeId)}/connections`,
  );
  const nameOf = (id: string) => {
    const node = nodes.find((candidate) => candidate.id === id);
    return node ? nodeDisplayName(node, "en") : id;
  };

  return (
    <section aria-labelledby="connection-list-heading">
      <h2 id="connection-list-heading" className="mb-2 font-medium text-lg">
        Connections of {nameOf(nodeId)}
      </h2>
      {resource.status === "loading" && <p>Loading connections…</p>}
      {resource.status === "failed" && (
        <p role="alert">Could not load connections: {resource.error.message}</p>
      )}
      {resource.status === "loaded" && (
        <ul className="space-y-2">
          {resource.data.connections.map((connection) => {
            const [sourceId, targetId] =
              connection.direction === "outgoing"
                ? [nodeId, connection.neighborId]
                : [connection.neighborId, nodeId];
            return (
              <li key={connection.id} className="rounded border border-line px-3 py-2">
                <p>
                  {nameOf(sourceId)} <code className="text-sm">{connection.relation}</code>{" "}
                  {nameOf(targetId)}
                </p>
                <p className="text-muted text-sm">
                  {connection.kind} · {connection.basis} · {connection.licence}
                  {connection.qualityFlags.length > 0 &&
                    ` · flagged: ${connection.qualityFlags.join(", ")}`}
                </p>
                <ConnectionSources connection={connection} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
