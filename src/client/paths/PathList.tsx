import { Fragment } from "react";
import type { RankedPath } from "../../shared/findPaths";
import type { NodeKind } from "../../shared/graph";
import { maxPathSteps, type PathsResponse, pathNeighborLimit } from "../../shared/pathQuery";
import { KindChip } from "../KindChip";
import { NodeLink } from "../NodeLink";
import { useApiResource } from "../useApiResource";
import { listLegendKinds } from "./listLegendKinds";
import { listRankingReasons } from "./listRankingReasons";
import { PathChain } from "./PathChain";
import { PathLegend } from "./PathLegend";
import { PathNode } from "./PathNode";
import { PathStepItem } from "./PathStepItem";

type PathListProps = {
  /** The query parameters of the path search, including the filter. */
  params: URLSearchParams;
  nameOf: (nodeId: string) => string;
  kindOf: (nodeId: string) => NodeKind | undefined;
};

/** Lists the best paths between two nodes, best first, explaining each path's rank and showing it step by step. */
export function PathList({ params, nameOf, kindOf }: PathListProps) {
  const resource = useApiResource<PathsResponse>(`/api/paths?${params}`);

  if (resource.status === "loading") return <p>Finding paths…</p>;
  if (resource.status === "failed") {
    return <p role="alert">Could not find paths: {resource.error.message}</p>;
  }
  if (resource.data.paths.length === 0) {
    return (
      <p role="status" className="text-muted">
        No path of up to {maxPathSteps} steps was found. Since the search follows at most{" "}
        {pathNeighborLimit} neighbours of each node, a path may still exist through a node with more
        than {pathNeighborLimit} neighbours.
      </p>
    );
  }
  const { paths } = resource.data;
  return (
    <>
      <p className="text-muted text-sm">
        Paths through nodes with fewer neighbours, and paths that mix kinds of connection, are
        listed first, since they are more likely to show a specific relationship.
      </p>
      <PathLegend {...listLegendKinds(paths, kindOf)} />
      <ol aria-label="Paths" className="space-y-4">
        {paths.map((path, index) => (
          <PathItem
            key={path.nodeIds.join(" ")}
            path={path}
            rank={index + 1}
            graph={{ nameOf, kindOf }}
          />
        ))}
      </ol>
    </>
  );
}

type PathItemProps = {
  path: RankedPath;
  rank: number;
  graph: Pick<PathListProps, "nameOf" | "kindOf">;
};

function PathItem({ path, rank, graph }: PathItemProps) {
  const { nameOf, kindOf } = graph;
  const stepCount = `${path.steps.length} ${path.steps.length === 1 ? "step" : "steps"}`;
  const reasons = [stepCount, ...listRankingReasons(path)];
  return (
    <li className="space-y-2 rounded border border-line px-3 py-2">
      <h3 className="font-medium">
        {rank}.{" "}
        {path.nodeIds.map((nodeId, index) => (
          // A node appears at most once in a path.
          <Fragment key={nodeId}>
            {index > 0 && " → "}
            <NodeLink nodeId={nodeId} name={nameOf(nodeId)} />
          </Fragment>
        ))}
      </h3>
      <p className="text-muted text-sm">{reasons.join(" · ")}</p>
      <ul aria-label={`Kinds of connection in path ${rank}`} className="flex flex-wrap gap-1">
        {path.kinds.map((kind) => (
          <li key={kind}>
            <KindChip kind={kind} />
          </li>
        ))}
      </ul>
      <PathChain path={path} rank={rank} nameOf={nameOf} kindOf={kindOf} />
      <div className="pt-1">
        <PathNode name={nameOf(path.nodeIds[0] ?? "")} lead="from" />
        <ol aria-label={`Steps of path ${rank}`}>
          {path.steps.map((step) => (
            <PathStepItem key={`${step.fromNodeId} ${step.toNodeId}`} step={step} nameOf={nameOf} />
          ))}
        </ol>
      </div>
    </li>
  );
}
