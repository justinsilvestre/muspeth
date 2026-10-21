import clsx from "clsx";
import { Link, useLocation } from "react-router";
import { organismPath } from "../organismPath";
import type { NodeCatalog } from "./createNodeCatalog";
import { NodeSummary } from "./NodeSummary";
import type { NodeMatch } from "./searchNodes";

type NodeLinkListProps = {
  matches: NodeMatch[];
  catalog: NodeCatalog;
  selectedNodeId: string | undefined;
};

/** Links each matching node to its connections. */
export function NodeLinkList({ matches, catalog, selectedNodeId }: NodeLinkListProps) {
  // Keeps the connection filters in the address when another node is chosen.
  const { search } = useLocation();

  return (
    <ul className="space-y-1">
      {matches.map(({ node, matchedName }) => (
        <li key={node.id}>
          <Link
            to={{ pathname: organismPath(node.id), search }}
            aria-current={node.id === selectedNodeId ? "page" : undefined}
            className={clsx(
              "block w-full rounded px-3 py-2 text-left hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ink",
              node.id === selectedNodeId && "bg-selected hover:bg-selected",
            )}
          >
            <NodeSummary
              node={node}
              isNameShared={catalog.sharedNameNodeIds.has(node.id)}
              matchedName={matchedName}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
