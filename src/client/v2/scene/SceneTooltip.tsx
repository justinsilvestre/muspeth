import clsx from "clsx";
import type { ReactNode } from "react";
import { placeBesidePointer, type ScenePointer } from "./ScenePointer";

type SceneTooltipProps = {
  pointer: ScenePointer;
  /** Whether the tooltip keeps a fixed width, for content such as pictures that should not set its width. */
  isWide?: boolean;
  children: ReactNode;
};

/** Shows what is pointed at or was last tapped in a scene, floating beside the pointer. */
export function SceneTooltip({ pointer, isWide, children }: SceneTooltipProps) {
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
