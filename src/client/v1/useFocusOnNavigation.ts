import { type RefObject, useEffect } from "react";
import { useNavigationType } from "react-router";

/**
 * Focuses an element, scrolling it into view, whenever a followed link changes the given key.
 * Leaves focus and scrolling to the browser on first load and on back or forward navigation.
 */
export function useFocusOnNavigation(ref: RefObject<HTMLElement | null>, key: string) {
  const navigationType = useNavigationType();
  // biome-ignore lint/correctness/useExhaustiveDependencies: the focus follows changes of the key only.
  useEffect(() => {
    if (navigationType === "PUSH") ref.current?.focus();
  }, [key]);
}
