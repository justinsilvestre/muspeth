import { useMemo } from "react";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import type { LabelOffset } from "../glottometry/placeLabels";
import type { Appearance } from "./appearance";
import { TextSprite } from "./TextSprite";
import { useUndulatingMaterial } from "./undulation";

type LanguageNucleusProps = {
  name: string;
  label: string;
  position: PlanePoint;
  labelOffset: LabelOffset;
  labelHeight: number;
  labelColor: string;
  appearance: Appearance;
  /** Whether to draw the body faintly, as one that nothing in the diagram reaches. */
  isDimmed?: boolean;
};

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus(props: LanguageNucleusProps) {
  const { name, label, position, labelOffset, labelHeight, labelColor, appearance, isDimmed } =
    props;
  const nucleusColor = appearance.color.nucleus;
  const parameters = useMemo(
    () => ({
      color: nucleusColor,
      emissive: nucleusColor,
      emissiveIntensity: isDimmed ? 0.1 : 0.9,
      roughness: 0.3,
    }),
    [nucleusColor, isDimmed],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement);
  return (
    <group position={[position.x, position.y, 0.1]}>
      <mesh material={material}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      {/* A larger, fully transparent body around the nucleus, so that pointing near the nucleus still picks its language. */}
      <mesh userData={useMemo(() => ({ language: name }), [name])}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group position={[labelOffset.dx, labelOffset.dy, 0.3]}>
        <TextSprite text={label} color={labelColor} height={labelHeight} anchor={labelOffset} />
      </group>
    </group>
  );
}
