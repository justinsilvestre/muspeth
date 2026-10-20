import { useSearchParams } from "react-router";
import type { GraphNode } from "../../shared/graph";
import { createNodeNamer } from "../createNodeNamer";
import { ConnectionFilterControls } from "../filters/ConnectionFilterControls";
import { useConnectionFilter } from "../filters/useConnectionFilter";
import { NodePicker } from "./NodePicker";
import { PathList } from "./PathList";

/** Lets the reader pick two nodes, and shows the best paths between them. */
export function PathsView({ nodes }: { nodes: GraphNode[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterResult, setFilter } = useConnectionFilter();
  const nameOf = createNodeNamer(nodes);
  const options = nodes
    .map((node) => ({ id: node.id, name: nameOf(node.id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const [fromId, toId] = [searchParams.get("from") ?? "", searchParams.get("to") ?? ""];
  const choose = (name: "from" | "to", nodeId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(name, nodeId);
    setSearchParams(next);
  };

  return (
    <section aria-labelledby="paths-heading" className="space-y-4">
      <h2 id="paths-heading" className="font-medium text-lg">
        Paths between two nodes
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <NodePicker
          label="From"
          options={options}
          selectedNodeId={fromId}
          onChange={(id) => choose("from", id)}
        />
        <NodePicker
          label="To"
          options={options}
          selectedNodeId={toId}
          onChange={(id) => choose("to", id)}
        />
      </div>
      {!filterResult.ok && (
        <p role="alert">Could not read the filters in this address: {filterResult.error}</p>
      )}
      {filterResult.ok && (
        <ConnectionFilterControls filter={filterResult.value} onChange={setFilter} />
      )}
      {fromId && toId && fromId === toId && (
        <p className="text-muted">Choose two different nodes.</p>
      )}
      {filterResult.ok && fromId && toId && fromId !== toId && (
        <PathList params={searchParams} nameOf={nameOf} />
      )}
    </section>
  );
}
