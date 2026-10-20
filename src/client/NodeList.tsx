import clsx from "clsx";
import { Link } from "react-router";
import type { GraphNode } from "../shared/graph";
import { nodeDisplayName } from "./nodeDisplayName";
import { organismPath } from "./organismPath";

type NodeListProps = {
  nodes: GraphNode[];
  selectedNodeId: string | undefined;
};

export function NodeList({ nodes, selectedNodeId }: NodeListProps) {
  return (
    <section aria-labelledby="node-list-heading">
      <h2 id="node-list-heading" className="mb-2 font-medium text-lg">
        Organisms
      </h2>
      <ul className="space-y-1">
        {nodes.map((node) => (
          <li key={node.id}>
            <Link
              to={organismPath(node.id)}
              aria-current={node.id === selectedNodeId ? "page" : undefined}
              className={clsx(
                "block w-full rounded px-3 py-2 text-left hover:bg-subtle",
                node.id === selectedNodeId && "bg-selected hover:bg-selected",
              )}
            >
              <span className="block">{nodeDisplayName(node, "en")}</span>
              <span className="block text-muted text-sm">
                <i>{node.label}</i> · {nodeDisplayName(node, "ja")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
