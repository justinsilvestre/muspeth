import clsx from "clsx";
import type { ReactNode, Ref } from "react";

type ScrollColumnProps = {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  children: ReactNode;
};

/** Holds one column of a view that fills the screen, scrolling on its own on wide screens. */
export function ScrollColumn({ ref, className, children }: ScrollColumnProps) {
  return (
    // The padding keeps focus outlines at the column's edges from being cut off.
    <div
      ref={ref}
      className={clsx(
        "md:-mx-1 md:overflow-y-auto md:overscroll-contain md:px-1 md:pt-1 md:pb-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
