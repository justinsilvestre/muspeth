import { useDeferredValue, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { NodeKind } from "../../shared/graph";
import { countMatchesByKind } from "./countMatchesByKind";
import type { NodeCatalog } from "./createNodeCatalog";
import { describeMatchCount } from "./describeMatchCount";
import { findShownMatches } from "./findShownMatches";
import { KindChoices } from "./KindChoices";
import { KindOverview } from "./KindOverview";
import { NodeLinkList } from "./NodeLinkList";
import { NodeQueryField } from "./NodeQueryField";
import { SelectedNode } from "./SelectedNode";
import { ShowMoreButton } from "./ShowMoreButton";
import { matchPageSize, useShownMatchCount } from "./useShownMatchCount";

type NodeSearchProps = {
  catalog: NodeCatalog;
  selectedNodeId: string | undefined;
};

/** Finds nodes by any of their names or by kind, and links each match to its connections. */
export function NodeSearch({ catalog, selectedNodeId }: NodeSearchProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<NodeKind>();
  const kindChoicesRef = useRef<HTMLFieldSetElement>(null);
  const matchListRef = useRef<HTMLUListElement>(null);
  // Keeps typing responsive while the matches of the latest query are found.
  const deferredQuery = useDeferredValue(query);
  const isBrowsingKinds = !deferredQuery.trim() && !kind;
  const shownCount = useShownMatchCount(`${kind ?? ""}:${deferredQuery}`);
  const { matches, totalCount } = findShownMatches(catalog, deferredQuery, kind, shownCount.count);
  const hiddenCount = (totalCount ?? 0) - matches.length;
  const selectedNode = selectedNodeId ? catalog.nodesById.get(selectedNodeId) : undefined;

  // The kind overview disappears once a kind is chosen, so focus moves to the kind's choice in its place.
  const chooseKindFromOverview = (chosenKind: NodeKind) => {
    flushSync(() => setKind(chosenKind));
    kindChoicesRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
  };

  // Focus moves to the first new match, as the button that showed it may disappear.
  const showMoreMatches = (shouldFocus: boolean) => {
    flushSync(shownCount.showMore);
    if (shouldFocus) matchListRef.current?.querySelectorAll("a")[matches.length]?.focus();
  };

  return (
    <section aria-labelledby="node-search-heading" className="space-y-3">
      <h2 id="node-search-heading" className="font-medium text-lg">
        Nodes
      </h2>
      {selectedNode && <SelectedNode node={selectedNode} catalog={catalog} />}
      <NodeQueryField query={query} onQueryChange={setQuery} />
      {!isBrowsingKinds && (
        <KindChoices
          ref={kindChoicesRef}
          kind={kind}
          countsByKind={countMatchesByKind(catalog, deferredQuery)}
          onKindChange={setKind}
        />
      )}
      <p aria-live="polite" className="text-muted text-sm">
        {isBrowsingKinds
          ? `Search ${catalog.nodes.length.toLocaleString("en")} nodes by any name, or start with a kind:`
          : describeMatchCount(matches.length, totalCount ?? 0)}
      </p>
      {isBrowsingKinds ? (
        <KindOverview catalog={catalog} onKindChoose={chooseKindFromOverview} />
      ) : (
        <NodeLinkList
          ref={matchListRef}
          matches={matches}
          catalog={catalog}
          selectedNodeId={selectedNodeId}
        />
      )}
      {!isBrowsingKinds && hiddenCount > 0 && (
        <ShowMoreButton
          nextCount={Math.min(hiddenCount, matchPageSize)}
          onShowMore={showMoreMatches}
        />
      )}
    </section>
  );
}
