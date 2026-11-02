import type { CSSProperties, PointerEvent } from "react";

/** Where the pointer last was over a scene, in pixels from its top left, with the scene's size and whether a finger was used. */
export type ScenePointer = {
  x: number;
  y: number;
  width: number;
  height: number;
  isTouch: boolean;
};

/** How far a tooltip stands off from the pointer, in pixels. */
const offset = 14;
/** The widest a tooltip grows, in pixels, where the scene has room for it. */
const widestTooltip = 288;

export const restingPointer = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isTouch: false,
} satisfies ScenePointer;

/** Reads where a pointer event happened over the element it is handled on. */
export function toScenePointer(event: PointerEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    width: bounds.width,
    height: bounds.height,
    isTouch: event.pointerType === "touch",
  } satisfies ScenePointer;
}

/**
 * Places a tooltip beside the pointer, on whichever side of it faces the middle of the scene,
 * and keeps it narrow enough to stay inside the scene.
 */
export function placeBesidePointer({ x, y, width, height }: ScenePointer) {
  const isRightHalf = x > width / 2;
  const room = (isRightHalf ? x : width - x) - 2 * offset;
  return {
    ...(isRightHalf ? { right: width - x + offset } : { left: x + offset }),
    maxWidth: Math.min(widestTooltip, room),
    ...(y > height / 2 ? { bottom: height - y + offset } : { top: y + offset }),
  } satisfies CSSProperties;
}
