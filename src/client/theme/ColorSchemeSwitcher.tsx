import clsx from "clsx";
import { type CSSProperties, useRef, useState } from "react";
import { ColorSchemeIcon } from "./ColorSchemeIcon";
import { type ColorSchemePreference, colorSchemePreferences } from "./colorSchemePreference";
import { placeMenuBelow } from "./placeMenuBelow";
import { useColorScheme } from "./useColorScheme";

const preferenceLabels = { system: "System", light: "Light", dark: "Dark" };

/**
 * Shows an icon button that opens a menu of color scheme preferences.
 * The menu is a native popover, so the browser closes it on an outside click or the Escape key.
 * It is placed below the button as it opens, since not every browser can anchor a popover to its button in CSS.
 */
export function ColorSchemeSwitcher() {
  const { preference, setPreference } = useColorScheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPlacement, setMenuPlacement] = useState<CSSProperties>();
  const placeMenu = () => {
    const button = buttonRef.current?.getBoundingClientRect();
    if (!button) return;
    const scroll = { x: window.scrollX, y: window.scrollY };
    setMenuPlacement(placeMenuBelow(button, scroll, document.documentElement.clientWidth));
  };
  const choose = (candidate: ColorSchemePreference) => {
    setPreference(candidate);
    menuRef.current?.hidePopover?.();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget="color-scheme-menu"
        aria-label="Color scheme"
        title="Color scheme"
        className="rounded p-1.5 text-muted hover:text-ink"
      >
        <ColorSchemeIcon preference={preference} />
      </button>
      <div
        ref={menuRef}
        id="color-scheme-menu"
        popover="auto"
        onBeforeToggle={(event) => event.newState === "open" && placeMenu()}
        style={menuPlacement}
        className="absolute inset-auto m-0 flex-col rounded border border-line bg-page p-1 text-ink text-sm shadow-md [&:popover-open]:flex"
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
