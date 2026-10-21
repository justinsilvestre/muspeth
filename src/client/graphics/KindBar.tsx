import clsx from "clsx";
import type { ReactNode } from "react";
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

type KindBarProps = {
  from: Point;
  to: Point;
  kind: ConnectionKind;
  /** Content shown when the reader hovers over the bar, usually an SVG `<title>`. */
  children?: ReactNode;
};

/** Draws a thick, round-ended SVG bar in the colour of a kind of connection. */
export function KindBar({ from, to, kind, children }: KindBarProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      className={clsx("stroke-[6] [stroke-linecap:round]", strokeByKind[kind])}
    >
      {children}
    </line>
  );
}
