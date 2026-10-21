type ExplorerHeadingProps = {
  title: string;
  clearLabel: string;
  /** Clears what was chosen, or is absent when nothing was. */
  onClear?: () => void;
};

/** Heads a map or timeline with a button that clears the place or period chosen on it. */
export function ExplorerHeading({ title, clearLabel, onClear }: ExplorerHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="font-medium text-sm">{title}</h3>
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
