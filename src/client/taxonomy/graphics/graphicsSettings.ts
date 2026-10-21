import type { BarkMaterialId } from "./barkMaterials";
import type { ShadingStyleId } from "./shadingStyles";

export type GraphicsSettings = {
  barkMaterialId: BarkMaterialId;
  shading: ShadingStyleId;
  /** The radius of the trunk where the tree's first fork leaves it. */
  trunkRadius: number;
  /** How much of its thickness a branch keeps from one rank to the next. */
  taperPerRank: number;
  /** A multiple of the leaves' standard size. */
  leafSize: number;
  /** Whether the leaves of organisms with an image show that image. */
  showsLeafImages: boolean;
  /** The space between each branch tip and its leaf. */
  leafGap: number;
  /** How far leaves spread from the crown's rim across its width, from 0 to 1. */
  leafSpread: number;
  /** How far branches rotate away from upright, arching the crown into a dome. */
  branchSplay: number;
  /** How far the crown departs from a perfectly regular shape, from 0 to 1. */
  irregularity: number;
};

type GraphicsSettingsAction =
  | { type: "changed"; changes: Partial<GraphicsSettings> }
  | { type: "reset" };

export const defaultGraphicsSettings = {
  barkMaterialId: "slate",
  shading: "toon",
  trunkRadius: 0.5,
  taperPerRank: 0.58,
  leafSize: 0.9,
  showsLeafImages: true,
  leafGap: 0.06,
  leafSpread: 1,
  branchSplay: 0.85,
  irregularity: 0.2,
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
