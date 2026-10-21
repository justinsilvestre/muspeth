import { Fragment } from "react";
import type { PathGroup } from "./groupPathVariants";
import { listRankingReasons } from "./listRankingReasons";
import { PathStepItem } from "./PathStepItem";

type PathDetailsProps = {
  group: PathGroup;
  rank: number;
  nameOf: (nodeId: string) => string;
  onSelectNode: (nodeId: string) => void;
};

/**
 * Explains a path's rank and states each of its steps as a connection.
 * When other paths differ from it by one node only, it names their nodes, each of which the reader can select.
 */
export function PathDetails({ group, rank, nameOf, onSelectNode }: PathDetailsProps) {
  const [path, ...variants] = group.paths;
  if (!path) return null;
  const position = group.variantPosition ?? 0;
  const variantIds = variants.map(({ nodeIds }) => nodeIds[position] ?? "");
  return (
    <section aria-labelledby="path-details-heading" className="space-y-1">
      <h3 id="path-details-heading" className="font-medium">
        Path {rank}
      </h3>
      <p className="text-muted text-sm">{listRankingReasons(path).join(" · ")}</p>
      <ol aria-label={`Steps of path ${rank}`}>
        {path.steps.map((step) => (
          <PathStepItem key={`${step.fromNodeId} ${step.toNodeId}`} step={step} nameOf={nameOf} />
        ))}
      </ol>
      {variantIds.length > 0 && (
        <p className="text-sm">
          <span className="text-muted">Also through </span>
          {variantIds.map((nodeId, index) => (
            <Fragment key={nodeId}>
              {index > 0 && (
                <span className="text-muted">
                  {index === variantIds.length - 1 ? " or " : ", "}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectNode(nodeId)}
                className="rounded-xs underline decoration-faint underline-offset-2 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                {nameOf(nodeId)}
              </button>
            </Fragment>
          ))}
          <span className="text-muted"> in place of {nameOf(path.nodeIds[position] ?? "")}.</span>
        </p>
      )}
    </section>
  );
}
