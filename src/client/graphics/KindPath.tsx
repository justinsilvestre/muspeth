import clsx from "clsx";
import type { ConnectionKind } from "../../shared/graph";

const strokeByKind = {
  interaction: "stroke-kind-interaction",
  likeness: "stroke-kind-likeness",
  shared_substance: "stroke-kind-shared-substance",
  shared_culture: "stroke-kind-shared-culture",
  shared_words_and_stories: "stroke-kind-shared-words-and-stories",
  shared_place_and_sound: "stroke-kind-shared-place-and-sound",
} satisfies Record<ConnectionKind, string>;

type KindPathProps = {
  /** The SVG path data of the line. */
  d: string;
  kind: ConnectionKind;
  /** Dashed lines stand for connections that were computed or attributed rather than observed. */
  dashed?: boolean;
  className?: string;
};

/** Draws an SVG line, straight or curved, in the colour of a kind of connection. */
export function KindPath({ d, kind, dashed = false, className }: KindPathProps) {
  return (
    <path
      d={d}
      strokeDasharray={dashed ? "5 4" : undefined}
      className={clsx(
        "fill-none [stroke-linecap:round]",
        strokeByKind[kind],
        className ?? "stroke-2",
      )}
    />
  );
}
