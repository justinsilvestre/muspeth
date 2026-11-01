import { useEffect, useRef, useState } from "react";

/** Measures an element's width in pixels as it resizes, starting from a fallback until it is first measured. */
export function useElementWidth<Element extends HTMLElement | SVGElement>(fallback: number) {
  const ref = useRef<Element>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    // Test environments such as jsdom have no ResizeObserver.
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}
