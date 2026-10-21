import type { PathStep } from "../../shared/findPaths";
import { relationLabel } from "../relationLabel";
import { foldStepConnections } from "./foldStepConnections";

/**
 * Describes how to draw a step of a path as a link: its kind, a relation label that points the way the connection runs, and whether it is dashed.
 * Connections that are computed or attributed, rather than observed, are dashed.
 */
export function describeChainLink(step: PathStep) {
  const { shown } = foldStepConnections(step);
  if (!shown) return undefined;
  const relation = relationLabel(shown.relation);
  const isForward = shown.sourceNodeId === step.fromNodeId;
  return {
    kind: shown.kind,
    label: isForward ? `${relation} →` : `← ${relation}`,
    dashed: shown.basis !== "observed",
  };
}
