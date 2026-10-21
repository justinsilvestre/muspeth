import { useState } from "react";
import type { NodeKind } from "../../shared/graph";
import { maxPathSteps, type PathsResponse, pathNeighborLimit } from "../../shared/pathQuery";
import { useApiResource } from "../useApiResource";
import { createPathNodeDescriber } from "./createPathNodeDescriber";
import { listLegendKinds } from "./listLegendKinds";
import { NodeDetails } from "./NodeDetails";
import { PathBraid } from "./PathBraid";
import { PathDetails } from "./PathDetails";
import { PathLegend } from "./PathLegend";
import { PathSelector } from "./PathSelector";
import type { PathSelection } from "./pathSelection";

type PathResultsProps = {
  /** The query parameters of the path search, including the filter. */
  params: URLSearchParams;
  nameOf: (nodeId: string) => string;
  kindOf: (nodeId: string) => NodeKind | undefined;
};

/**
 * Shows the best paths between two nodes drawn together, with the details of the path or node the reader selects.
 * The best path is selected at first.
 */
export function PathResults({ params, nameOf, kindOf }: PathResultsProps) {
  const resource = useApiResource<PathsResponse>(`/api/paths?${params}`);
  const [selection, setSelection] = useState<PathSelection>({ pathIndex: 0 });

  if (resource.status === "loading") return <p>Finding paths…</p>;
  if (resource.status === "failed") {
    return <p role="alert">Could not find paths: {resource.error.message}</p>;
  }
  const { paths, truncated, media } = resource.data;
  if (paths.length === 0) return <NoPathNotice truncated={truncated} />;
  const describeNode = createPathNodeDescriber({ nameOf, kindOf }, paths, media);
  const selectedPath = "pathIndex" in selection ? paths[selection.pathIndex] : undefined;
  return (
    <div className="space-y-3">
      <PathSelector paths={paths} selection={selection} onSelect={setSelection} />
      <PathBraid
        paths={paths}
        describeNode={describeNode}
        selection={selection}
        onSelect={setSelection}
      />
      <PathLegend {...listLegendKinds(paths, kindOf)} />
      <div className="rounded border border-line bg-panel px-4 py-3">
        {selectedPath && (
          <PathDetails
            path={selectedPath}
            rank={"pathIndex" in selection ? selection.pathIndex + 1 : 0}
            nameOf={nameOf}
          />
        )}
        {"nodeId" in selection && (
          <NodeDetails nodeId={selection.nodeId} paths={paths} describeNode={describeNode} />
        )}
      </div>
    </div>
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
