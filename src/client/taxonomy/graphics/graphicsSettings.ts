import type { BarkMaterialId } from "./barkMaterials";

export type GraphicsSettings = {
  barkMaterialId: BarkMaterialId;
  /** The radius of the trunk where the tree's first fork leaves it. */
  trunkRadius: number;
  /** How much of its thickness a branch keeps from one rank to the next. */
  taperPerRank: number;
  /** A multiple of the leaves' standard size. */
  leafSize: number;
  /** The space between each branch tip and its leaf. */
  leafGap: number;
};

type GraphicsSettingsAction =
  | { type: "changed"; changes: Partial<GraphicsSettings> }
  | { type: "reset" };

export const defaultGraphicsSettings = {
  barkMaterialId: "bark",
  trunkRadius: 0.3,
  taperPerRank: 0.72,
  leafSize: 1,
  leafGap: 0.06,
} satisfies GraphicsSettings;

const storageKey = "graphicsSettings";

export function graphicsSettingsReducer(
  settings: GraphicsSettings,
  action: GraphicsSettingsAction,
) {
  if (action.type === "reset") return defaultGraphicsSettings;
  return { ...settings, ...action.changes };
}

export function readStoredGraphicsSettings(): GraphicsSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return { ...defaultGraphicsSettings, ...stored };
  } catch {
    return defaultGraphicsSettings;
  }
}

export function storeGraphicsSettings(settings: GraphicsSettings) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Without storage, the settings last only until the page reloads.
  }
}
