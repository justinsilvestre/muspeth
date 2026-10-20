import type { ColorScheme } from "../theme/colorSchemePreference";

/** Colors of the 3D tree, which can't use CSS tokens because they are drawn with WebGL. */
export const treePalettes = {
  light: { bark: "#6b4f3a", barkHighlight: "#a8714a", leaf: "#4d7c4f", leafHighlight: "#6aa86c" },
  dark: { bark: "#9c7b5e", barkHighlight: "#dba56c", leaf: "#78b07a", leafHighlight: "#a8dca2" },
} satisfies Record<ColorScheme, Record<string, string>>;

export type TreePalette = (typeof treePalettes)[ColorScheme];
