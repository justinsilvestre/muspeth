import type { PlanePoint } from "./layoutLanguages";

/** Where a label sits relative to the point it names. */
export type LabelOffset = { dx: number; dy: number };

type LabelSpec = { name: string; text: string; position: PlanePoint };

/** The corners a label may be placed at, tried in this order: to the lower right first, as reads most naturally. */
const corners = [
  { dx: 1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 1 },
];

/**
 * Chooses a corner for each label so that labels of nearby points do not overlap where that can be avoided.
 * Labels are placed one by one, each taking the first corner where it clears the labels already placed
 * and the other points. Widths are estimated from the text's length and height.
 */
export function placeLabels(labels: LabelSpec[], height: number) {
  const placed: { box: Box; name: string }[] = [];
  const offsets = new Map<string, LabelOffset>();
  for (const label of labels) {
    const candidates = corners.map((corner) => ({ corner, box: boxFor(label, corner, height) }));
    const clear = candidates.find(({ box }) => !placed.some((other) => overlaps(box, other.box)));
    const chosen = clear ?? candidates[0];
    if (chosen) {
      placed.push({ box: chosen.box, name: label.name });
      offsets.set(label.name, { dx: chosen.corner.dx * height, dy: chosen.corner.dy * height });
    }
  }
  return offsets;
}

type Box = { left: number; right: number; bottom: number; top: number };

/** A label's text is about half as wide per character as it is tall, in a proportional font. */
function boxFor({ text, position }: LabelSpec, corner: LabelOffset, height: number) {
  const width = text.length * height * 0.55;
  const centerX = position.x + corner.dx * (height + width / 2);
  const centerY = position.y + corner.dy * height;
  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    bottom: centerY - height / 2,
    top: centerY + height / 2,
  } satisfies Box;
}

function overlaps(a: Box, b: Box) {
  return a.left < b.right && b.left < a.right && a.bottom < b.top && b.bottom < a.top;
}
