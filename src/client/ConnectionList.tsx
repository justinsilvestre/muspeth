import { type ConnectionFilter, writeConnectionFilter } from "../shared/connectionFilter";
import type { Connection, GraphNode } from "../shared/graph";
import { apiPath } from "./apiPath";
import { ConnectionSentence } from "./ConnectionSentence";
import { ConnectionSources } from "./ConnectionSources";
import { createNodeNamer } from "./createNodeNamer";
import { ConnectionFilterControls } from "./filters/ConnectionFilterControls";
import { termLabel } from "./termLabel";
import { useApiResource } from "./useApiResource";

type ConnectionListProps = {
  nodeId: string;
  nodes: GraphNode[];
  filter: ConnectionFilter;
  onFilterChange: (filter: ConnectionFilter) => void;
};

export function ConnectionList({ nodeId, nodes, filter, onFilterChange }: ConnectionListProps) {
  const resource = useApiResource<{ connections: Connection[] }>(
    apiPath(
      `/api/nodes/${encodeURIComponent(nodeId)}/connections`,
      writeConnectionFilter(new URLSearchParams(), filter),
    ),
  );
  const nameOf = createNodeNamer(nodes);

  return (
    <section aria-labelledby="connection-list-heading">
      <h2 id="connection-list-heading" className="mb-2 font-medium text-lg">
        Connections of {nameOf(nodeId)}
      </h2>
      <ConnectionFilterControls filter={filter} onChange={onFilterChange} />
      {resource.status === "loading" && <p>Loading connections…</p>}
      {resource.status === "failed" && (
        <p role="alert">Could not load connections: {resource.error.message}</p>
      )}
      {resource.status === "loaded" && resource.data.connections.length === 0 && (
        <p className="text-muted">No connections pass these filters.</p>
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
                <ConnectionSentence
                  sourceName={nameOf(sourceId)}
                  relation={connection.relation}
                  targetName={nameOf(targetId)}
                />
                <p className="text-muted text-sm">
                  {termLabel(connection.kind)} · {connection.basis} · {connection.licence}
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
