import { Fragment } from "react";
import type { RankedPath } from "../../shared/findPaths";
import type { NodeKind } from "../../shared/graph";
import { maxPathSteps, type PathsResponse, pathNeighborLimit } from "../../shared/pathQuery";
import { KindChip } from "../KindChip";
import { NodeLink } from "../NodeLink";
import { useApiResource } from "../useApiResource";
import { CostBar } from "./CostBar";
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
    return <NoPathNotice truncated={resource.data.truncated} />;
  }
  const { paths } = resource.data;
  const worstCost = Math.max(...paths.map(({ cost }) => cost));
  return (
    <>
      <p className="text-muted text-sm">
        Paths that avoid hubs, the nodes with many neighbours, and that cross more kinds of
        connection rank higher. Each path's score sums the cost of its steps, so a lower score ranks
        higher.
      </p>
      <PathLegend {...listLegendKinds(paths, kindOf)} />
      <ol aria-label="Paths" className="space-y-4">
        {paths.map((path, index) => (
          <PathItem
            key={path.nodeIds.join(" ")}
            path={path}
            rank={index + 1}
            worstCost={worstCost}
            graph={{ nameOf, kindOf }}
          />
        ))}
      </ol>
    </>
  );
}

function NoPathNotice({ truncated }: Pick<PathsResponse, "truncated">) {
  return (
    <p role="status" className="text-muted">
      {truncated ? (
        <>
          No path of up to {maxPathSteps} steps was found. Since the search follows at most{" "}
          {pathNeighborLimit} neighbours of each node, a path may still exist through a node with
          more than {pathNeighborLimit} neighbours.
        </>
      ) : (
        <>These two nodes are not connected by any path of up to {maxPathSteps} steps.</>
      )}
    </p>
  );
}

type PathItemProps = {
  path: RankedPath;
  rank: number;
  worstCost: number;
  graph: Pick<PathListProps, "nameOf" | "kindOf">;
};

function PathItem({ path, rank, worstCost, graph }: PathItemProps) {
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
      <p className="text-muted text-sm">
        {reasons.join(" · ")} ·{" "}
        <span className="whitespace-nowrap">
          score {path.cost.toFixed(2)} <CostBar cost={path.cost} worstCost={worstCost} />
        </span>
      </p>
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
