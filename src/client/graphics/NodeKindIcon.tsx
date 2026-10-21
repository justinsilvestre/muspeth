import type { NodeKind } from "../../shared/graph";
import { NodeKindShape } from "./NodeKindShape";

/** Shows the shape that stands for a kind of node at the size of a letter. It is decorative, so it should sit beside the kind's name. */
export function NodeKindIcon({ kind }: { kind: NodeKind }) {
  return (
    <svg aria-hidden="true" viewBox="-11 -11 22 22" className="size-4 shrink-0">
      <NodeKindShape kind={kind} at={{ x: 0, y: 0 }} />
    </svg>
  );
}
