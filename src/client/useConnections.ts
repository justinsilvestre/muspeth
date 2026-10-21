import { type ConnectionFilter, writeConnectionFilter } from "../shared/connectionFilter";
import type { Connection } from "../shared/graph";
import { apiPath } from "./apiPath";
import { useApiResource } from "./useApiResource";

type ConnectionsResponse = { connections: Connection[] };
type LoadedConnections = { path: string; data: ConnectionsResponse };

/**
 * Fetches the connections of a node that pass the filter.
 * While another filter's connections load, the node's last list stays available, marked as reloading.
 */
export function useConnections(nodeId: string, filter: ConnectionFilter) {
  const nodePath = `/api/nodes/${encodeURIComponent(nodeId)}/connections`;
  const path = apiPath(nodePath, writeConnectionFilter(new URLSearchParams(), filter));
  const resource = useApiResource<ConnectionsResponse>(path);
  if (resource.status === "failed") return resource;
  if (resource.status === "loaded" && resource.path === path) {
    return { status: "loaded", data: resource.data, isReloading: false } as const;
  }
  return describeReloading(resource.status === "loaded" ? resource : resource.previous, path);
}

function describeReloading(previous: LoadedConnections | undefined, path: string) {
  if (!previous || !isSameNode(previous.path, path)) return { status: "loading" } as const;
  return { status: "loaded", data: previous.data, isReloading: true } as const;
}

function isSameNode(path: string, otherPath: string) {
  return path.split("?")[0] === otherPath.split("?")[0];
}
