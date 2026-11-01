import type { PlanePoint } from "../glottometry/layoutLanguages";

/**
 * Nudges points apart until no two lie closer than the given distance, so that bodies which the layout
 * put in the same place, because they share the same partners, can each be seen and labelled.
 * Each pass pushes every too-close pair away from each other along the line between them;
 * a pair in exactly the same place is pushed along a direction chosen from its order in the map.
 */
export function spreadApart(positions: Map<string, PlanePoint>, minimumDistance: number) {
  const names = [...positions.keys()];
  const points = names.map((name) => ({ ...(positions.get(name) ?? { x: 0, y: 0 }) }));
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        if (!a || !b) continue;
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (distance >= minimumDistance) continue;
        const angle = distance === 0 ? (i * 7 + j * 3) * 0.9 : Math.atan2(b.y - a.y, b.x - a.x);
        const push = (minimumDistance - distance) / 2;
        a.x -= Math.cos(angle) * push;
        a.y -= Math.sin(angle) * push;
        b.x += Math.cos(angle) * push;
        b.y += Math.sin(angle) * push;
        moved = true;
      }
    if (!moved) break;
  }
  return new Map(names.map((name, i) => [name, points[i] ?? { x: 0, y: 0 }]));
}
