import { useSearchParams } from "react-router";
import type { GraphNode } from "../../shared/graph";
import { createNodeNamer } from "../createNodeNamer";
import { ConnectionFilterControls } from "../filters/ConnectionFilterControls";
import { useConnectionFilter } from "../filters/useConnectionFilter";
import { NodeCombobox } from "../nodeSearch/NodeCombobox";
import { useNodeCatalog } from "../nodeSearch/useNodeCatalog";
import { PathList } from "./PathList";
import { SwapButton } from "./SwapButton";

/** Lets the reader pick two nodes, and shows the best paths between them. */
export function PathsView({ nodes }: { nodes: GraphNode[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterResult, setFilter } = useConnectionFilter();
  const catalog = useNodeCatalog(nodes);
  const nameOf = createNodeNamer(nodes);
  const [fromId, toId] = [searchParams.get("from") ?? "", searchParams.get("to") ?? ""];
  const chooseEnds = (ends: { from?: string; to?: string }) => {
    const next = new URLSearchParams(searchParams);
    for (const [name, nodeId] of Object.entries(ends)) writeParameter(next, name, nodeId);
    setSearchParams(next);
  };

  return (
    <section aria-labelledby="paths-heading" className="space-y-4">
      <h2 id="paths-heading" className="font-medium text-lg">
        Paths between two nodes
      </h2>
      <div className="grid items-start gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
        <NodeCombobox
          label="From"
          catalog={catalog}
          selectedNodeId={fromId}
          onChange={(id) => chooseEnds({ from: id })}
        />
        <SwapButton
          disabled={!fromId && !toId}
          onClick={() => chooseEnds({ from: toId, to: fromId })}
        />
        <NodeCombobox
          label="To"
          catalog={catalog}
          selectedNodeId={toId}
          onChange={(id) => chooseEnds({ to: id })}
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

/** Sets a query parameter, or removes it when the value is empty. */
function writeParameter(params: URLSearchParams, name: string, value: string) {
  if (value) params.set(name, value);
  else params.delete(name);
}
