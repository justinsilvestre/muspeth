import type { RankedPath } from "../../shared/findPaths";
import { connectionKinds, type NodeKind, nodeKinds } from "../../shared/graph";
import { foldStepConnections } from "./foldStepConnections";

/** Lists the kinds of node and connection that the drawn paths show, so that a legend names only those. */
export function listLegendKinds(
  paths: RankedPath[],
  kindOf: (nodeId: string) => NodeKind | undefined,
) {
  const nodeKindsShown = new Set(paths.flatMap(({ nodeIds }) => nodeIds.map(kindOf)));
  const connectionsShown = paths
    .flatMap(({ steps }) => steps.map((step) => foldStepConnections(step).shown))
    .filter((connection) => connection !== undefined);
  const connectionKindsShown = new Set(connectionsShown.map(({ kind }) => kind));
  return {
    nodeKinds: nodeKinds.filter((kind) => nodeKindsShown.has(kind)),
    connectionKinds: connectionKinds.filter((kind) => connectionKindsShown.has(kind)),
    hasUnobserved: connectionsShown.some(({ basis }) => basis !== "observed"),
  };
}
