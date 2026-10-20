import type { RankedPath } from "../../shared/findPaths";
import type { PathsResponse } from "../../shared/pathQuery";
import { ConnectionSentence } from "../ConnectionSentence";
import { termLabel } from "../termLabel";
import { useApiResource } from "../useApiResource";

type PathListProps = {
  /** The query parameters of the path search, including the filter. */
  params: URLSearchParams;
  nameOf: (nodeId: string) => string;
};

/** Lists the best paths between two nodes, best first, with every connection along each step. */
export function PathList({ params, nameOf }: PathListProps) {
  const resource = useApiResource<PathsResponse>(`/api/paths?${params}`);

  if (resource.status === "loading") return <p>Finding paths…</p>;
  if (resource.status === "failed") {
    return <p role="alert">Could not find paths: {resource.error.message}</p>;
  }
  if (resource.data.paths.length === 0) {
    return <p className="text-muted">No path of up to four steps joins these two.</p>;
  }
  return (
    <ol aria-label="Paths" className="space-y-4">
      {resource.data.paths.map((path, index) => (
        <PathItem key={path.nodeIds.join(" ")} path={path} rank={index + 1} nameOf={nameOf} />
      ))}
    </ol>
  );
}

type PathItemProps = {
  path: RankedPath;
  rank: number;
  nameOf: (nodeId: string) => string;
};

function PathItem({ path, rank, nameOf }: PathItemProps) {
  const stepCount = `${path.steps.length} ${path.steps.length === 1 ? "step" : "steps"}`;
  return (
    <li className="rounded border border-line px-3 py-2">
      <h3 className="font-medium">
        {rank}. {path.nodeIds.map(nameOf).join(" → ")}
      </h3>
      <p className="mb-2 text-muted text-sm">
        {stepCount} · {path.kinds.map(termLabel).join(", ")} · cost {path.cost.toFixed(2)}
      </p>
      <ol aria-label={`Steps of path ${rank}`} className="list-decimal space-y-2 pl-5">
        {path.steps.map((step) => (
          <li key={`${step.fromNodeId} ${step.toNodeId}`}>
            {step.connections.map((connection) => (
              <div key={connection.id}>
                <ConnectionSentence
                  sourceName={nameOf(connection.sourceNodeId)}
                  relation={connection.relation}
                  targetName={nameOf(connection.targetNodeId)}
                />
                <p className="text-muted text-sm">
                  {termLabel(connection.kind)} · {connection.basis} · {connection.source}
                  {connection.qualityFlags.length > 0 &&
                    ` · flagged: ${connection.qualityFlags.join(", ")}`}
                </p>
              </div>
            ))}
          </li>
        ))}
      </ol>
    </li>
  );
}
