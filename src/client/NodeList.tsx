import clsx from "clsx";
import type { GraphNode } from "../shared/graph";
import { nodeDisplayName } from "./nodeDisplayName";

type NodeListProps = {
  nodes: GraphNode[];
  selectedNodeId: string | undefined;
  onSelect: (nodeId: string) => void;
};

export function NodeList({ nodes, selectedNodeId, onSelect }: NodeListProps) {
  return (
    <section aria-labelledby="node-list-heading">
      <h2 id="node-list-heading" className="mb-2 font-medium text-lg">
        Organisms
      </h2>
      <ul className="space-y-1">
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              aria-pressed={node.id === selectedNodeId}
              onClick={() => onSelect(node.id)}
              className={clsx(
                "w-full rounded px-3 py-2 text-left hover:bg-stone-100",
                node.id === selectedNodeId && "bg-stone-200 hover:bg-stone-200",
              )}
            >
              <span className="block">{nodeDisplayName(node, "en")}</span>
              <span className="block text-sm text-stone-600">
                <i>{node.label}</i> · {nodeDisplayName(node, "ja")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
