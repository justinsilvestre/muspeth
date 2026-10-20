import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type ColorScheme,
  type ColorSchemePreference,
  readStoredPreference,
  resolveColorScheme,
  storePreference,
} from "./colorSchemePreference";

const darkQuery = "(prefers-color-scheme: dark)";

const ColorSchemeContext = createContext<{
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
  colorScheme: ColorScheme;
}>({ preference: "system", setPreference: () => {}, colorScheme: "light" });

/** Provides the viewer's color scheme preference, and applies the resolved scheme to the page. */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [preference, setStatePreference] = useState(readStoredPreference);
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemScheme, doesSystemPreferDark);
  const colorScheme = resolveColorScheme(preference, systemPrefersDark);
  const setPreference = (next: ColorSchemePreference) => {
    storePreference(next);
    setStatePreference(next);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", colorScheme === "dark");
  }, [colorScheme]);

  return (
    <ColorSchemeContext value={{ preference, setPreference, colorScheme }}>
      {children}
    </ColorSchemeContext>
  );
}

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

function subscribeToSystemScheme(onChange: () => void) {
  const query = window.matchMedia?.(darkQuery);
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
}

function doesSystemPreferDark() {
  return window.matchMedia?.(darkQuery).matches ?? false;
}
