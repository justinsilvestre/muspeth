import type { PlanePoint } from "../glottometry/layoutLanguages";

/** Positions keyed by the name of what they place. */
export type Positions = Map<string, PlanePoint>;

/** Eases a share of a glide from a standing start to a gentle stop. */
export function easeInOut(progress: number) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return clamped < 0.5 ? 2 * clamped ** 2 : 1 - (-2 * clamped + 2) ** 2 / 2;
}

/**
 * Places each name part of the way from where it was to where it is going.
 * A name with no earlier position starts where it is going, so that new dots appear in place rather than flying in.
 */
export function glidePositions(from: Positions, to: Positions, share: number): Positions {
  return new Map(
    [...to].map(([name, target]) => {
      const start = from.get(name) ?? target;
      return [
        name,
        { x: start.x + (target.x - start.x) * share, y: start.y + (target.y - start.y) * share },
      ];
    }),
  );
}
