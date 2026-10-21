import clsx from "clsx";
import type { ConnectionKind } from "../shared/graph";

const backgroundByKind = {
  interaction: "bg-kind-interaction",
  likeness: "bg-kind-likeness",
  shared_substance: "bg-kind-shared-substance",
  shared_culture: "bg-kind-shared-culture",
  shared_words_and_stories: "bg-kind-shared-words-and-stories",
  shared_place_and_sound: "bg-kind-shared-place-and-sound",
} satisfies Record<ConnectionKind, string>;

type KindMarkProps = {
  kind: ConnectionKind;
  /** A dot sits beside a label; a rail runs down the side of its container. */
  shape: "dot" | "rail";
};

/** Marks a kind of connection with its colour. It is decorative, so it should sit beside the kind's name. */
export function KindMark({ kind, shape }: KindMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "shrink-0 rounded-full",
        backgroundByKind[kind],
        shape === "dot" ? "size-2" : "w-1 self-stretch",
      )}
    />
  );
}
