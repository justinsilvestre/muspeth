import { Link, useLocation } from "react-router";
import { type GraphNode, type NodeKind, nodeKinds } from "../../shared/graph";
import { NodeKindIcon } from "../graphics/NodeKindIcon";
import { nodeDisplayName } from "../nodeDisplayName";
import { organismPath } from "../organismPath";
import type { NodeCatalog } from "./createNodeCatalog";
import { nodeKindPluralLabels } from "./nodeKindLabels";

const numberFormat = new Intl.NumberFormat("en");

type KindOverviewProps = {
  catalog: NodeCatalog;
  onKindChoose: (kind: NodeKind) => void;
};

/** Offers every kind of node with its count and a few examples, so the reader sees their range before searching. */
export function KindOverview({ catalog, onKindChoose }: KindOverviewProps) {
  const shownKinds = nodeKinds.filter((kind) => catalog.nodeCountsByKind[kind] > 0);
  return (
    <ul
      aria-label="Kinds of node"
      className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2"
    >
      {shownKinds.map((kind) => (
        <li key={kind} className="min-w-0 rounded border border-line px-3 py-2">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            onClick={() => onKindChoose(kind)}
          >
            <NodeKindIcon kind={kind} />
            {nodeKindPluralLabels[kind]}{" "}
            <span className="whitespace-nowrap font-normal text-muted">
              · {numberFormat.format(catalog.nodeCountsByKind[kind])}
            </span>
          </button>
          <ExampleLinks nodes={catalog.examplesByKind[kind]} />
        </li>
      ))}
    </ul>
  );
}

/** Links a few nodes to their connections, keeping the connection filters in the address. */
function ExampleLinks({ nodes }: { nodes: GraphNode[] }) {
  const { search } = useLocation();
  return (
    <ul aria-label="Examples" className="mt-1 text-sm">
      {nodes.map((node) => (
        <li key={node.id} className="truncate">
          <Link
            to={{ pathname: organismPath(node.id), search }}
            title={nodeDisplayName(node, "en")}
            className="text-muted underline decoration-line underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
          >
            {nodeDisplayName(node, "en")}
          </Link>
        </li>
      ))}
    </ul>
  );
}
