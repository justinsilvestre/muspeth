type SwapButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

/** Exchanges the two ends of a path. */
export function SwapButton({ disabled, onClick }: SwapButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Swap From and To"
      className="justify-self-start rounded border border-line px-3 py-2 text-sm hover:bg-subtle focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-1 disabled:opacity-50 disabled:hover:bg-transparent sm:mt-6"
    >
      <span aria-hidden="true">⇄ </span>Swap
    </button>
  );
}
