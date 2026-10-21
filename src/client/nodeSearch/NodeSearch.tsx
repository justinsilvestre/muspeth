import { useDeferredValue, useState } from "react";
import type { NodeKind } from "../../shared/graph";
import type { NodeCatalog } from "./createNodeCatalog";
import { describeMatchCount } from "./describeMatchCount";
import { findShownMatches } from "./findShownMatches";
import { NodeLinkList } from "./NodeLinkList";
import { NodeSearchFields } from "./NodeSearchFields";
import { SelectedNode } from "./SelectedNode";

type NodeSearchProps = {
  catalog: NodeCatalog;
  selectedNodeId: string | undefined;
};

/** Finds nodes by any of their names, and links each match to its connections. */
export function NodeSearch({ catalog, selectedNodeId }: NodeSearchProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<NodeKind>();
  // Keeps typing responsive while the matches of the latest query are found.
  const deferredQuery = useDeferredValue(query);
  const { matches, totalCount } = findShownMatches(catalog, deferredQuery, kind);
  const selectedNode = selectedNodeId ? catalog.nodesById.get(selectedNodeId) : undefined;

  return (
    <section aria-labelledby="node-search-heading" className="space-y-3">
      <h2 id="node-search-heading" className="font-medium text-lg">
        Nodes
      </h2>
      {selectedNode && <SelectedNode node={selectedNode} catalog={catalog} />}
      <NodeSearchFields query={query} kind={kind} onQueryChange={setQuery} onKindChange={setKind} />
      <p aria-live="polite" className="text-muted text-sm">
        {totalCount === undefined
          ? `Search ${catalog.nodes.length.toLocaleString("en")} nodes by any name, or start here:`
          : describeMatchCount(matches.length, totalCount)}
      </p>
      <NodeLinkList matches={matches} catalog={catalog} selectedNodeId={selectedNodeId} />
    </section>
  );
}
