import type { PlanePoint } from "../glottometry/layoutLanguages";
import { LanguageLabel } from "./LanguageLabel";
import { useUndulatingMaterial } from "./undulation";

type LanguageNucleusProps = { name: string; position: PlanePoint; labelColor: string };

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus({ name, position, labelColor }: LanguageNucleusProps) {
  const material = useUndulatingMaterial({
    color: "#f5e9c8",
    emissive: "#d9a441",
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
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
