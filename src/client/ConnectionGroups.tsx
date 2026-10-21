import type { ReactNode } from "react";
import type { Connection } from "../shared/graph";
import { ConnectionRow } from "./ConnectionRow";
import { groupConnectionsByKind } from "./groupConnectionsByKind";
import { relationLabel } from "./relationLabel";
import { termLabel } from "./termLabel";

/** Above this many connections, only the first kind starts open, so the reader sees the counts first. */
const openKindsLimit = 60;

type ConnectionGroupsProps = {
  nodeId: string;
  connections: Connection[];
  nameOf: (nodeId: string) => string;
  renderThumbnail: (nodeId: string) => ReactNode;
};

/** Lists a node's connections under collapsible kinds, each divided by relation. */
export function ConnectionGroups({
  nodeId,
  connections,
  nameOf,
  renderThumbnail,
}: ConnectionGroupsProps) {
  const opensEveryKind = connections.length <= openKindsLimit;
  return (
    <div className="space-y-2">
      {groupConnectionsByKind(connections, nameOf).map((kindGroup, index) => (
        <details
          key={kindGroup.kind}
          open={opensEveryKind || index === 0}
          className="rounded border border-line px-3 py-1"
        >
          <summary className="cursor-pointer py-1 font-medium focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2">
            {sentenceCase(termLabel(kindGroup.kind))}
            <Count count={kindGroup.count} />
          </summary>
          {kindGroup.relationGroups.map((relationGroup) => (
            <RelationGroup
              key={`${relationGroup.relation} ${relationGroup.direction}`}
              {...relationGroup}
              nodeName={nameOf(nodeId)}
              nameOf={nameOf}
              renderThumbnail={renderThumbnail}
              isCounted={kindGroup.relationGroups.length > 1}
            />
          ))}
        </details>
      ))}
    </div>
  );
}

type RelationGroupProps = {
  relation: string;
  direction: Connection["direction"];
  connections: Connection[];
  nodeName: string;
  nameOf: (nodeId: string) => string;
  renderThumbnail: (nodeId: string) => ReactNode;
  isCounted: boolean;
};

function RelationGroup({
  relation,
  direction,
  connections,
  nodeName,
  nameOf,
  renderThumbnail,
  isCounted,
}: RelationGroupProps) {
  return (
    <div className="mt-1 mb-2">
      <h3 className="text-muted text-sm">
        <RelationPhrase relation={relation} direction={direction} nodeName={nodeName} />
        {isCounted && <Count count={connections.length} />}
      </h3>
      <ul className="divide-y divide-line">
        {connections.map((connection) => (
          <ConnectionRow
            key={connection.id}
            connection={connection}
            nodeName={nodeName}
            nameOf={nameOf}
            thumbnail={renderThumbnail(connection.neighborId)}
          />
        ))}
      </ul>
    </div>
  );
}

type RelationPhraseProps = {
  relation: string;
  direction: Connection["direction"];
  nodeName: string;
};

/** States a relation with the node at its end and an ellipsis standing for the neighbours listed below. */
function RelationPhrase({ relation, direction, nodeName }: RelationPhraseProps) {
  const label = <span className="font-medium text-ink">{relationLabel(relation)}</span>;
  if (direction === "outgoing") {
    return (
      <>
        {nodeName} {label} <span aria-hidden="true">…</span>
      </>
    );
  }
  return (
    <>
      <span aria-hidden="true">…</span> {label} {nodeName}
    </>
  );
}

function Count({ count }: { count: number }) {
  return <span className="font-normal text-muted"> · {count}</span>;
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
