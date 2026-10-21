import type { ReactNode } from "react";

type ExplorerHeadingProps = {
  title: string;
  clearLabel: string;
  /** Clears what was chosen, or is absent when nothing was. */
  onClear?: () => void;
  /** Controls for adjusting what was chosen, shown beside the title. */
  children?: ReactNode;
};

/** Heads a map or timeline with a button that clears the place or period chosen on it. */
export function ExplorerHeading({ title, clearLabel, onClear, children }: ExplorerHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h3 className="font-medium text-sm">{title}</h3>
        {children}
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm underline underline-offset-2 hover:text-ink"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
