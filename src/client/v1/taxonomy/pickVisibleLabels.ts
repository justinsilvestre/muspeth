type Rect = { left: number; top: number; width: number; height: number };

/**
 * Picks the labels to show, in order of priority, skipping any that would overlap a label already picked.
 * A greedy pass is not the densest arrangement, but it is fast enough to run every frame.
 */
export function pickVisibleLabels(labels: { id: string; rect: Rect }[]) {
  const pickedRects: Rect[] = [];
  const pickedIds = new Set<string>();
  for (const { id, rect } of labels) {
    if (pickedRects.some((picked) => doOverlap(picked, rect))) continue;
    pickedRects.push(rect);
    pickedIds.add(id);
  }
  return pickedIds;
}

function doOverlap(a: Rect, b: Rect) {
  return (
    a.left < b.left + b.width &&
    b.left < a.left + a.width &&
    a.top < b.top + b.height &&
    b.top < a.top + a.height
  );
}
