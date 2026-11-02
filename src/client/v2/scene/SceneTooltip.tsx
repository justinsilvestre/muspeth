import clsx from "clsx";
import type { ReactNode } from "react";
import { placeBesidePointer, type ScenePointer } from "./ScenePointer";

type SceneTooltipProps = {
  pointer: ScenePointer;
  /** Whether the tooltip keeps a fixed width, for content such as pictures that should not set its width. */
  isWide?: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Shows what is pointed at in a scene. With a mouse it floats beside the pointer.
 * With a finger, which would cover it, it is a panel of its own to be placed below the scene, with a button that closes it.
 */
export function SceneTooltip({ pointer, isWide, onClose, children }: SceneTooltipProps) {
  if (pointer.isTouch)
    return (
      <aside
        aria-label="What you tapped"
        className="relative rounded border border-line bg-panel px-3 py-2 pr-9 text-sm"
      >
        {children}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-1 right-1 size-8 rounded text-lg text-muted leading-none hover:text-ink"
        >
          ×
        </button>
      </aside>
    );
  return (
    <div
      role="tooltip"
      className={clsx(
        "pointer-events-none absolute z-10 rounded border border-line bg-panel/95 px-2 py-1.5 text-xs shadow",
        isWide && "w-72",
      )}
      style={placeBesidePointer(pointer)}
    >
      {children}
    </div>
  );
}
