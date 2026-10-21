import type { RankedPath } from "../../shared/findPaths";
import { listRankingReasons } from "./listRankingReasons";
import { PathStepItem } from "./PathStepItem";

type PathDetailsProps = {
  path: RankedPath;
  rank: number;
  nameOf: (nodeId: string) => string;
};

/** Explains a path's rank and states each of its steps as a connection. */
export function PathDetails({ path, rank, nameOf }: PathDetailsProps) {
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
    </section>
  );
}
