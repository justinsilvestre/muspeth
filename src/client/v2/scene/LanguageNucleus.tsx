import type { PlanePoint } from "../glottometry/layoutLanguages";
import type { Appearance } from "./appearance";
import { LanguageLabel } from "./LanguageLabel";
import { useUndulatingMaterial } from "./undulation";

type LanguageNucleusProps = {
  name: string;
  position: PlanePoint;
  labelColor: string;
  appearance: Appearance;
};

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus({ name, position, labelColor, appearance }: LanguageNucleusProps) {
  const material = useUndulatingMaterial(
    {
      color: appearance.color.nucleus,
      emissive: appearance.color.nucleus,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    },
    appearance.movement,
  );
  return (
    <group position={[position.x, position.y, 0.1]}>
      <mesh material={material}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      <group position={[0.25, -0.25, 0.3]}>
        <LanguageLabel text={name.replace("Ⓛ", "")} color={labelColor} size={0.5} />
      </group>
    </group>
  );
}
