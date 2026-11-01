import { useMemo } from "react";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import type { LabelOffset } from "../glottometry/placeLabels";
import type { Appearance } from "./appearance";
import { TextSprite } from "./TextSprite";
import { useUndulatingMaterial } from "./undulation";

type LanguageNucleusProps = {
  label: string;
  position: PlanePoint;
  labelOffset: LabelOffset;
  labelHeight: number;
  labelColor: string;
  appearance: Appearance;
};

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus(props: LanguageNucleusProps) {
  const { label, position, labelOffset, labelHeight, labelColor, appearance } = props;
  const nucleusColor = appearance.color.nucleus;
  const parameters = useMemo(
    () => ({ color: nucleusColor, emissive: nucleusColor, emissiveIntensity: 0.9, roughness: 0.3 }),
    [nucleusColor],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement);
  return (
    <group position={[position.x, position.y, 0.1]}>
      <mesh material={material}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      <group position={[labelOffset.dx, labelOffset.dy, 0.3]}>
        <TextSprite text={label} color={labelColor} height={labelHeight} anchor={labelOffset} />
      </group>
    </group>
  );
}
