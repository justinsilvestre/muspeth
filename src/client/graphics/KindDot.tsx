import clsx from "clsx";
import type { ReactNode } from "react";
import type { ConnectionKind } from "../../shared/graph";
import type { Point } from "./Point";

const fillByKind = {
  interaction: "fill-kind-interaction",
  likeness: "fill-kind-likeness",
  shared_substance: "fill-kind-shared-substance",
  shared_culture: "fill-kind-shared-culture",
  shared_words_and_stories: "fill-kind-shared-words-and-stories",
  shared_place_and_sound: "fill-kind-shared-place-and-sound",
} satisfies Record<ConnectionKind, string>;

type KindDotProps = {
  at: Point;
  kind: ConnectionKind;
  /** Content shown when the reader hovers over the dot, usually an SVG `<title>`. */
  children?: ReactNode;
};

/** Draws an SVG dot in the colour of a kind of connection, ringed by the page colour so that overlapping dots stay apart. */
export function KindDot({ at, kind, children }: KindDotProps) {
  return (
    <circle cx={at.x} cy={at.y} r={4.5} className={clsx("stroke-2 stroke-page", fillByKind[kind])}>
      {children}
    </circle>
  );
}
