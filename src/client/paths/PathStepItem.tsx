import type { PathStep } from "../../shared/findPaths";
import type { GraphEdge } from "../../shared/graphExport";
import { ConnectionMeta } from "../ConnectionMeta";
import { ConnectionSentence } from "../ConnectionSentence";
import { KindMark } from "../KindMark";
import { foldStepConnections } from "./foldStepConnections";

type PathStepItemProps = {
  step: PathStep;
  nameOf: (nodeId: string) => string;
};

/**
 * Shows one step of a path as a connection, marked with the colour of its kind.
 * The step's other connections are folded behind a disclosure.
 */
export function PathStepItem({ step, nameOf }: PathStepItemProps) {
  const { shown, folded } = foldStepConnections(step);
  return (
    <li>
      <div className="flex gap-3">
        {shown && <KindMark kind={shown.kind} shape="rail" />}
        <div className="min-w-0 py-2">
          {shown && <StepConnection connection={shown} nameOf={nameOf} />}
          {folded.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-muted text-sm">
                +{folded.length} more {folded.length === 1 ? "connection" : "connections"}
              </summary>
              <div className="mt-1 space-y-1">
                {folded.map((connection) => (
                  <StepConnection key={connection.id} connection={connection} nameOf={nameOf} />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </li>
  );
}

type StepConnectionProps = {
  connection: GraphEdge;
  nameOf: (nodeId: string) => string;
};

function StepConnection({ connection, nameOf }: StepConnectionProps) {
  return (
    <div>
      <ConnectionSentence
        sourceId={connection.sourceNodeId}
        relation={connection.relation}
        targetId={connection.targetNodeId}
        nameOf={nameOf}
      />
      <ConnectionMeta {...connection} />
    </div>
  );
}
