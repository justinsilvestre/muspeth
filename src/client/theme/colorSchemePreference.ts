export const colorSchemePreferences = ["system", "light", "dark"] as const;

export type ColorSchemePreference = (typeof colorSchemePreferences)[number];
export type ColorScheme = Exclude<ColorSchemePreference, "system">;

/** The localStorage key, also read by the inline script in index.html. */
const storageKey = "colorSchemePreference";

export function resolveColorScheme(preference: ColorSchemePreference, systemPrefersDark: boolean) {
  if (preference !== "system") return preference;
  return systemPrefersDark ? "dark" : ("light" satisfies ColorScheme);
}

export function readStoredPreference(): ColorSchemePreference {
  try {
    const stored = localStorage.getItem(storageKey);
    return colorSchemePreferences.find((preference) => preference === stored) ?? "system";
  } catch {
    return "system";
  }
}

export function storePreference(preference: ColorSchemePreference) {
  try {
    localStorage.setItem(storageKey, preference);
  } catch {
    // Without storage, the preference lasts only until the page reloads.
  }
}
