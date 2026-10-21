import type { ConnectionKind } from "../../shared/graph";
import { KindPath } from "./KindPath";
import type { Point } from "./Point";

type KindLineProps = {
  from: Point;
  to: Point;
  kind: ConnectionKind;
  /** Dashed lines stand for connections that were computed or attributed rather than observed. */
  dashed?: boolean;
};

/** Draws a straight SVG line in the colour of a kind of connection. */
export function KindLine({ from, to, ...style }: KindLineProps) {
  return <KindPath d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} {...style} />;
}
