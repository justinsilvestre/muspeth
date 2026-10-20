import type { BarkMaterial } from "./barkMaterials";

/** Applies a bark material preset to its mesh, glowing softly while its lineage is highlighted. */
export function BarkMaterialView(props: { material: BarkMaterial; isHighlighted: boolean }) {
  const { material, isHighlighted } = props;
  const opacity = "opacity" in material ? material.opacity : 1;

  return (
    <meshPhysicalMaterial
      color={material.color}
      roughness={material.roughness}
      metalness={material.metalness}
      clearcoat={"clearcoat" in material ? material.clearcoat : 0}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
      emissive={material.color}
      emissiveIntensity={isHighlighted ? 0.7 : 0}
    />
  );
}
