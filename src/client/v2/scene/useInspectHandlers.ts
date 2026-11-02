import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import { type Hovered, pickHovered } from "./pickHovered";

/** How far a finger may move, in pixels, between touching the scene and lifting off for the touch to count as a tap rather than a drag. */
const tapTolerance = 10;

/**
 * Returns the pointer handlers that report what is inspected in a scene: what a mouse points at, or what a finger last tapped.
 * A finger dragging to turn the scene leaves what it last tapped in place.
 */
export function useInspectHandlers(onInspect: (inspected: Hovered | undefined) => void) {
  // R3F does not pass the pointer type to leave events, so it is remembered from the events that have it.
  const isTouch = useRef(false);
  const remember = (event: ThreeEvent<PointerEvent>) => {
    isTouch.current = event.pointerType === "touch";
  };
  return {
    onPointerDown: remember,
    onPointerMove: (event: ThreeEvent<PointerEvent>) => {
      remember(event);
      if (!isTouch.current) onInspect(pickHovered(event.intersections));
    },
    onPointerLeave: () => {
      if (!isTouch.current) onInspect(undefined);
    },
    onClick: (event: ThreeEvent<MouseEvent>) => {
      if (event.delta <= tapTolerance) onInspect(pickHovered(event.intersections));
    },
  };
}
