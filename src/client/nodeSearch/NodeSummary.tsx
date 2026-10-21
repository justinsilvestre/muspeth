import { Fragment } from "react";
import type { GraphNode } from "../../shared/graph";
import { nodeDisplayName } from "../nodeDisplayName";
import { KindBadge } from "./KindBadge";
import { listNodeDetails } from "./listNodeDetails";

type NodeSummaryProps = {
  node: GraphNode;
  isNameShared: boolean;
  matchedName?: string;
};

/** Shows a node's display name and kind, with the details that tell it apart beneath. */
export function NodeSummary({ node, isNameShared, matchedName }: NodeSummaryProps) {
  const displayName = nodeDisplayName(node, "en");
  const isScientific = node.kind === "organism" && displayName === node.label;

  return (
    <>
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="wrap-anywhere min-w-0">
          <NodeText text={displayName} isScientific={isScientific} />
        </span>
        <KindBadge kind={node.kind} />
      </span>
      <NodeDetailLine node={node} isNameShared={isNameShared} matchedName={matchedName} />
    </>
  );
}

/** Shows the details that tell a node apart from others with a similar name, if there are any. */
export function NodeDetailLine({ node, isNameShared, matchedName }: NodeSummaryProps) {
  const details = listNodeDetails(node, isNameShared, matchedName);
  if (details.length === 0) return null;

  return (
    <span className="wrap-anywhere block text-muted text-sm">
      {details.map(({ text, isScientific }, index) => (
        <Fragment key={text}>
          {index > 0 && " · "}
          <NodeText text={text} isScientific={isScientific} />
        </Fragment>
      ))}
    </span>
  );
}

function NodeText({ text, isScientific }: { text: string; isScientific: boolean }) {
  return isScientific ? <i>{text}</i> : <span>{text}</span>;
}
