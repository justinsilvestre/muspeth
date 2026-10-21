import clsx from "clsx";
import { useRef } from "react";
import { ColorSchemeIcon } from "./ColorSchemeIcon";
import { type ColorSchemePreference, colorSchemePreferences } from "./colorSchemePreference";
import { useColorScheme } from "./useColorScheme";

const preferenceLabels = { system: "System", light: "Light", dark: "Dark" };

/**
 * Shows an icon button that opens a menu of color scheme preferences.
 * The menu is a native popover, so the browser closes it on an outside click or the Escape key.
 */
export function ColorSchemeSwitcher() {
  const { preference, setPreference } = useColorScheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const choose = (candidate: ColorSchemePreference) => {
    setPreference(candidate);
    menuRef.current?.hidePopover?.();
  };

  return (
    <>
      <button
        type="button"
        popoverTarget="color-scheme-menu"
        aria-label="Color scheme"
        title="Color scheme"
        className="rounded p-1.5 text-muted [anchor-name:--color-scheme-button] hover:text-ink"
      >
        <ColorSchemeIcon preference={preference} />
      </button>
      <div
        ref={menuRef}
        id="color-scheme-menu"
        popover="auto"
        className="m-0 mt-1 flex-col rounded border border-line bg-page p-1 text-ink text-sm shadow-md [position-anchor:--color-scheme-button] [position-area:bottom_span-left] [&:popover-open]:flex"
      >
        {colorSchemePreferences.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={candidate === preference}
            onClick={() => choose(candidate)}
            className={clsx(
              "flex items-center gap-2 rounded px-2 py-1 text-left",
              candidate === preference ? "bg-selected" : "text-muted hover:text-ink",
            )}
          >
            <ColorSchemeIcon preference={candidate} />
            {preferenceLabels[candidate]}
          </button>
        ))}
      </div>
    </>
  );
}
