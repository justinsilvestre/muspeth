import { useEffect, useRef } from "react";

type ShowMoreButtonProps = {
  nextCount: number;
  /** Shows the next matches, moving focus to the first of them when the reader asked for them. */
  onShowMore: (shouldFocus: boolean) => void;
};

/** Shows the next page of matches when pressed, or by itself once scrolled into view. */
export function ShowMoreButton({ nextCount, onShowMore }: ShowMoreButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (!button) return;
    // Waits for a press while the button has focus, so that focus is never lost when it disappears.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && document.activeElement !== button) onShowMore(false);
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [onShowMore]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onShowMore(true)}
      className="w-full cursor-pointer rounded border border-line px-3 py-2 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ink"
    >
      Show {nextCount} more
    </button>
  );
}
