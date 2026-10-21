import clsx from "clsx";
import type { ConnectionKind } from "../../shared/graph";
import type { Point } from "./Point";

const strokeByKind = {
  interaction: "stroke-kind-interaction",
  likeness: "stroke-kind-likeness",
  shared_substance: "stroke-kind-shared-substance",
  shared_culture: "stroke-kind-shared-culture",
  shared_words_and_stories: "stroke-kind-shared-words-and-stories",
  shared_place_and_sound: "stroke-kind-shared-place-and-sound",
} satisfies Record<ConnectionKind, string>;

type KindLineProps = {
  from: Point;
  to: Point;
  kind: ConnectionKind;
  /** Dashed lines stand for connections that were computed or attributed rather than observed. */
  dashed?: boolean;
};

/** Draws an SVG line in the colour of a kind of connection. */
export function KindLine({ from, to, kind, dashed = false }: KindLineProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      strokeDasharray={dashed ? "5 4" : undefined}
      className={clsx("stroke-2 [stroke-linecap:round]", strokeByKind[kind])}
    />
  );
}
