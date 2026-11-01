import { useEffect, useMemo } from "react";
import { DoubleSide, MeshStandardMaterial } from "three";
import type { treePalettes } from "./treePalette";

/**
 * Creates the materials shared by every plain leaf: one for ordinary leaves and one for the highlighted lineage.
 * The highlight color is also given separately, for leaves that carry an image and so need materials of their own.
 */
export function useLeafMaterials(palette: (typeof treePalettes)[keyof typeof treePalettes]) {
  const materials = useMemo(
    () => ({
      plain: createLeafMaterial(palette.leaf),
      highlighted: createLeafMaterial(palette.leafHighlight),
      highlightColor: palette.leafHighlight,
    }),
    [palette],
  );
  useEffect(
    () => () => {
      materials.plain.dispose();
      materials.highlighted.dispose();
    },
    [materials],
  );
  return materials;
}

function createLeafMaterial(color: string) {
  return new MeshStandardMaterial({ color, side: DoubleSide, roughness: 0.6 });
}
