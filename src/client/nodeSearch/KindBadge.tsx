import type { NodeKind } from "../../shared/graph";
import { nodeKindLabels } from "./nodeKindLabels";

export function KindBadge({ kind }: { kind: NodeKind }) {
  return (
    <span className="shrink-0 rounded border border-current/30 px-1.5 font-normal text-muted text-xs not-italic">
      {nodeKindLabels[kind]}
    </span>
  );
}
