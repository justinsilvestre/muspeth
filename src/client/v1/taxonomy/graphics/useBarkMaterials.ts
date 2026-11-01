import { useEffect, useMemo } from "react";
import { Color, type Material, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import type { BarkMaterial } from "./barkMaterials";
import { createInkOutlineMaterial } from "./createInkOutlineMaterial";
import {
  createCelMaterial,
  createGoochMaterial,
  createHatchingMaterial,
} from "./illustrationShaders";
import type { ShadingStyleId } from "./shadingStyles";

/**
 * Creates the branch materials for a preset and shading style, shared by every branch:
 * one for ordinary branches, one for the highlighted lineage, and an ink outline for styles that draw one.
 */
export function useBarkMaterials(preset: BarkMaterial, shading: ShadingStyleId) {
  const materials = useMemo(
    () => ({
      plain: createBarkMaterial(preset, shading, false),
      highlighted: createBarkMaterial(preset, shading, true),
      outline: shading === "outlined" ? createInkOutlineMaterial(new Color(preset.color)) : null,
    }),
    [preset, shading],
  );
  useEffect(
    () => () => {
      materials.plain.dispose();
      materials.highlighted.dispose();
      materials.outline?.dispose();
    },
    [materials],
  );
  return materials;
}

function createBarkMaterial(
  preset: BarkMaterial,
  shading: ShadingStyleId,
  isHighlighted: boolean,
): Material {
  const baseColor = new Color(preset.color);
  // Stylized shading has no glow, so the highlight lightens the color instead.
  const color = isHighlighted ? baseColor.clone().lerp(new Color("#ffffff"), 0.4) : baseColor;
  switch (shading) {
    case "smooth":
      return createPhysicalMaterial(preset, isHighlighted);
    case "flat":
      return new MeshStandardMaterial({
        color,
        roughness: preset.roughness,
        metalness: preset.metalness,
        flatShading: true,
      });
    case "toon":
    case "outlined":
      return createCelMaterial(color);
    case "gooch":
      return createGoochMaterial(color);
    case "hatching":
      return createHatchingMaterial(color);
  }
}

function createPhysicalMaterial(preset: BarkMaterial, isHighlighted: boolean) {
  const opacity = "opacity" in preset ? preset.opacity : 1;
  return new MeshPhysicalMaterial({
    color: preset.color,
    roughness: preset.roughness,
    metalness: preset.metalness,
    clearcoat: "clearcoat" in preset ? preset.clearcoat : 0,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity === 1,
    emissive: preset.color,
    emissiveIntensity: isHighlighted ? 0.7 : 0,
  });
}
