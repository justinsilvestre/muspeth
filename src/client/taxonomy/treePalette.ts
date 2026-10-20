import type { ColorScheme } from "../theme/colorSchemePreference";

/** Leaf colors of the 3D tree, which can't use CSS tokens because they are drawn with WebGL. */
export const treePalettes = {
  light: { leaf: "#4d7c4f", leafHighlight: "#6aa86c" },
  dark: { leaf: "#78b07a", leafHighlight: "#a8dca2" },
} satisfies Record<ColorScheme, Record<string, string>>;
