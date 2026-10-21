import clsx from "clsx";
import type { ReactNode } from "react";
import type { ConnectionFilter } from "../shared/connectionFilter";
import type { GraphNode } from "../shared/graph";
import { ConnectionGroups } from "./ConnectionGroups";
import { createNodeKindReader } from "./createNodeKindReader";
import { createNodeNamer } from "./createNodeNamer";
import { ConnectionFilterControls } from "./filters/ConnectionFilterControls";
import { NodeFigure } from "./media/NodeFigure";
import { NodeThumbnail } from "./media/NodeThumbnail";
import { useConnections } from "./useConnections";

type ConnectionListProps = {
  nodeId: string;
  nodes: GraphNode[];
  filter: ConnectionFilter;
  onFilterChange: (filter: ConnectionFilter) => void;
};

export function ConnectionList({ nodeId, nodes, filter, onFilterChange }: ConnectionListProps) {
  const resource = useConnections(nodeId, filter);
  const nameOf = createNodeNamer(nodes);
  const kindOf = createNodeKindReader(nodes);
  const connections = resource.status === "loaded" ? resource.data.connections : [];
  const mediaById = resource.status === "loaded" ? resource.data.media : {};
  const media = mediaById[nodeId];
  const isReloading = resource.status === "loaded" && resource.isReloading;

  return (
    <section aria-labelledby="connection-list-heading">
      <header className="mb-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="connection-list-heading" className="font-medium text-lg">
            Connections of {nameOf(nodeId)}
          </h2>
          <Reloadable isReloading={isReloading}>
            <p className="min-h-5 text-muted text-sm">
              {resource.status === "loaded" && countConnections(connections.length)}
            </p>
          </Reloadable>
        </div>
        {media && <NodeFigure media={media} name={nameOf(nodeId)} />}
      </header>
      <ConnectionFilterControls filter={filter} onChange={onFilterChange} />
      {resource.status === "loading" && <p>Loading connections…</p>}
      {resource.status === "failed" && (
        <p role="alert">Could not load connections: {resource.error.message}</p>
      )}
      {resource.status === "loaded" && (
        <Reloadable isReloading={isReloading}>
          {connections.length === 0 && (
            <p className="text-muted">No connections pass these filters.</p>
          )}
          <ConnectionGroups
            nodeId={nodeId}
            connections={connections}
            nameOf={nameOf}
            renderThumbnail={(neighborId) => (
              <NodeThumbnail media={mediaById[neighborId]} kind={kindOf(neighborId)} />
            )}
          />
        </Reloadable>
      )}
    </section>
  );
}

/** Dims content that is about to be replaced, and marks it as busy for assistive technology. */
function Reloadable({ isReloading, children }: { isReloading: boolean; children: ReactNode }) {
  return (
    <div
      aria-busy={isReloading}
      className={clsx("transition-opacity", isReloading && "opacity-50")}
    >
      {children}
    </div>
  );
}

function countConnections(count: number) {
  return `${count} ${count === 1 ? "connection" : "connections"}`;
}
