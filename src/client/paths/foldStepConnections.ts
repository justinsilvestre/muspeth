import type { PathStep } from "../../shared/findPaths";

/**
 * Picks the connection to show for a step, and folds the others away.
 * It prefers a connection stated in the direction of the path, so that the step reads from the node it leaves.
 */
export function foldStepConnections({ fromNodeId, connections }: PathStep) {
  const shownIndex = Math.max(
    connections.findIndex(({ sourceNodeId }) => sourceNodeId === fromNodeId),
    0,
  );
  return {
    shown: connections[shownIndex],
    folded: connections.filter((_, index) => index !== shownIndex),
  };
}
