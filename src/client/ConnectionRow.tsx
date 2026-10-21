import type { ReactNode } from "react";
import type { Connection } from "../shared/graph";
import { ConnectionMeta } from "./ConnectionMeta";
import { ConnectionSources } from "./ConnectionSources";
import { NodeLink } from "./NodeLink";
import { relationLabel } from "./relationLabel";

type ConnectionRowProps = {
  connection: Connection;
  nodeName: string;
  nameOf: (nodeId: string) => string;
  /** A small image of the neighbour, shown before its name. */
  thumbnail: ReactNode;
};

/**
 * Shows one connection of a node under a heading that already names its kind and relation.
 * The neighbour leads; the rest of the sentence is spoken to assistive technology only.
 */
export function ConnectionRow({ connection, nodeName, nameOf, thumbnail }: ConnectionRowProps) {
  const relation = relationLabel(connection.relation);
  const isOutgoing = connection.direction === "outgoing";
  return (
    <li className="flex gap-3 py-1.5">
      {thumbnail}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="break-words font-medium">
            {isOutgoing && <span className="sr-only">{`${nodeName} ${relation} `}</span>}
            <NodeLink nodeId={connection.neighborId} name={nameOf(connection.neighborId)} />
            {!isOutgoing && <span className="sr-only">{` ${relation} ${nodeName}`}</span>}
          </p>
          <ConnectionMeta
            basis={connection.basis}
            source={connection.source}
            licence={connection.licence}
            qualityFlags={connection.qualityFlags}
          />
        </div>
        <ConnectionSources connection={connection} />
      </div>
    </li>
  );
}
