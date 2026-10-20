import clsx from "clsx";
import { colorSchemePreferences } from "./colorSchemePreference";
import { useColorScheme } from "./useColorScheme";

const preferenceLabels = { system: "System", light: "Light", dark: "Dark" };

export function ColorSchemeSwitcher() {
  const { preference, setPreference } = useColorScheme();

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add a visible legend and border.
    <div role="group" aria-label="Color scheme" className="flex rounded border border-line text-sm">
      {colorSchemePreferences.map((candidate) => (
        <button
          key={candidate}
          type="button"
          aria-pressed={candidate === preference}
          onClick={() => setPreference(candidate)}
          className={clsx(
            "px-2 py-1",
            candidate === preference ? "bg-selected" : "text-muted hover:text-ink",
          )}
        >
          {preferenceLabels[candidate]}
        </button>
      ))}
    </div>
  );
}
