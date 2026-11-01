import clsx from "clsx";
import type { ComponentProps } from "react";

/** A text field for a search, styled to match the rest of the page. */
export function SearchInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      autoComplete="off"
      spellCheck={false}
      className={clsx(
        "w-full min-w-0 rounded border border-line bg-page px-2 py-1.5 text-base placeholder:text-muted focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-1",
        className,
      )}
      {...props}
    />
  );
}
