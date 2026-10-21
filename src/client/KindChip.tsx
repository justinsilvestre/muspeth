import type { ConnectionKind } from "../shared/graph";
import { KindMark } from "./KindMark";
import { termLabel } from "./termLabel";

/** Names a kind of connection in a small label marked with the kind's colour. */
export function KindChip({ kind }: { kind: ConnectionKind }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs">
      <KindMark kind={kind} shape="dot" />
      {termLabel(kind)}
    </span>
  );
}
