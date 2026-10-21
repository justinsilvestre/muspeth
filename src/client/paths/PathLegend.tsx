import type { ReactNode } from "react";
import type { ConnectionKind, NodeKind } from "../../shared/graph";
import { KindLine } from "../graphics/KindLine";
import { NodeKindShape } from "../graphics/NodeKindShape";
import { termLabel } from "../termLabel";

type PathLegendProps = {
  nodeKinds: NodeKind[];
  connectionKinds: ConnectionKind[];
  hasUnobserved: boolean;
};

/** Names the node shapes and link colours that the path drawing uses, and says what the size of a node mark shows. */
export function PathLegend({ nodeKinds, connectionKinds, hasUnobserved }: PathLegendProps) {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-muted text-xs">
      {nodeKinds.map((kind) => (
        <LegendItem key={kind} label={termLabel(kind)}>
          <NodeKindShape kind={kind} at={{ x: 12, y: 10 }} />
        </LegendItem>
      ))}
      {connectionKinds.map((kind) => (
        <LegendItem key={kind} label={termLabel(kind)}>
          <KindLine from={{ x: 2, y: 10 }} to={{ x: 22, y: 10 }} kind={kind} />
        </LegendItem>
      ))}
      <LegendItem label="larger: more neighbours">
        <circle cx={5} cy={10} r={2.5} className="fill-page stroke-[1.5] stroke-ink" />
        <circle cx={16.5} cy={10} r={5.5} className="fill-page stroke-[1.5] stroke-ink" />
      </LegendItem>
      {hasUnobserved && (
        <LegendItem label="dashed: computed or attributed">
          <line
            x1={2}
            y1={10}
            x2={22}
            y2={10}
            strokeDasharray="5 4"
            className="stroke-2 stroke-muted"
          />
        </LegendItem>
      )}
    </ul>
  );
}

function LegendItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1">
      <svg aria-hidden="true" viewBox="0 0 24 20" width={24} height={20}>
        {children}
      </svg>
      {label}
    </li>
  );
}
