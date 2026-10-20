import clsx from "clsx";
import { Link } from "react-router";
import type { GraphNode } from "../shared/graph";
import { findDistinctName } from "./nodeDisplayName";
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
              <NodeNames node={node} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Shows the English name, the scientific label and the Japanese name, each only once. */
function NodeNames({ node }: { node: GraphNode }) {
  const englishName = findDistinctName(node, "en");
  const japaneseName = findDistinctName(node, "ja");

  return (
    <>
      <span className="block">{englishName ?? <i>{node.label}</i>}</span>
      {(englishName || japaneseName) && (
        <span className="block text-muted text-sm">
          {englishName && <i>{node.label}</i>}
          {englishName && japaneseName && " · "}
          {japaneseName}
        </span>
      )}
    </>
  );
}
