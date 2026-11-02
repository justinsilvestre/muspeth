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
 * With a finger, which would cover it, it is a panel across the scene's top or bottom edge, whichever is farther from the tap,
 * with a button that closes it.
 */
export function SceneTooltip({ pointer, isWide, onClose, children }: SceneTooltipProps) {
  if (pointer.isTouch)
    return (
      <aside
        aria-label="What you tapped"
        // Touches on the panel are kept from the scene, which would otherwise take them as a new tap position.
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        className={clsx(
          "absolute inset-x-2 z-20 max-h-[45%] overflow-y-auto rounded border border-line bg-panel/95 px-3 py-2 pr-9 text-sm shadow [&_img]:aspect-auto [&_img]:h-20",
          pointer.y > pointer.height / 2 ? "top-2" : "bottom-2",
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="sticky top-0 float-right -mt-1 -mr-8 size-8 rounded text-lg text-muted leading-none hover:text-ink"
        >
          ×
        </button>
        {children}
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
