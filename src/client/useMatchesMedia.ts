import { useSyncExternalStore } from "react";

/** Tells whether a CSS media query matches, updating when it starts or stops matching. Without media queries, as in tests, it never matches. */
export function useMatchesMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia?.(query);
      list?.addEventListener("change", onChange);
      return () => list?.removeEventListener("change", onChange);
    },
    () => window.matchMedia?.(query).matches ?? false,
  );
}
