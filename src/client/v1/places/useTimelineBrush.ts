import { type PointerEvent, useState } from "react";
import type { YearSpan } from "./layoutTimeline";

/**
 * Lets the reader drag across a timeline to choose a stretch of time, or click to choose a moment.
 * Returns the stretch being dragged, in decimal years, and the pointer handlers for the timeline's element.
 */
export function useTimelineBrush(domain: YearSpan, onBrush: (start: number, end: number) => void) {
  const [brushed, setBrushed] = useState<YearSpan | null>(null);
  const yearAt = (event: PointerEvent<Element>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    return domain.start + ((event.clientX - left) / width) * (domain.end - domain.start);
  };
  const handlers = {
    onPointerDown: (event: PointerEvent<Element>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const year = yearAt(event);
      setBrushed({ start: year, end: year });
    },
    onPointerMove: (event: PointerEvent<Element>) => {
      if (brushed) setBrushed({ ...brushed, end: yearAt(event) });
    },
    onPointerUp: () => {
      if (brushed) onBrush(brushed.start, brushed.end);
      setBrushed(null);
    },
    onPointerCancel: () => setBrushed(null),
  };
  return { brushed, handlers };
}
