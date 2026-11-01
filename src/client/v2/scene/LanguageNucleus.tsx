import { useMemo } from "react";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import type { LabelOffset } from "../glottometry/placeLabels";
import type { Appearance } from "./appearance";
import { TextSprite } from "./TextSprite";
import { useUndulatingMaterial } from "./undulation";

type LanguageNucleusProps = {
  name: string;
  label: string;
  /** A smaller, fainter second line beneath the label, such as a common name. */
  sublabel?: string;
  position: PlanePoint;
  labelOffset: LabelOffset;
  labelHeight: number;
  labelColor: string;
  appearance: Appearance;
  /** Whether to draw the body faintly, as one that nothing in the diagram reaches. */
  isDimmed?: boolean;
  /** Raised, the body glows larger, as a member of what the pointer is on; muted, it recedes. */
  emphasis?: Emphasis;
};

export type Emphasis = "raised" | "muted";

/** How brightly a body glows: dim when nothing reaches it, brighter as a member of what the pointer is on. */
function glow(isDimmed: boolean | undefined, emphasis: Emphasis | undefined) {
  if (emphasis === "raised") return 1.6;
  if (emphasis === "muted") return 0.3;
  return isDimmed ? 0.1 : 0.9;
}

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus(props: LanguageNucleusProps) {
  const { name, label, sublabel, position, labelOffset, labelHeight, labelColor, appearance } =
    props;
  const { isDimmed, emphasis } = props;
  const nucleusColor = appearance.color.nucleus;
  const parameters = useMemo(
    () => ({
      color: nucleusColor,
      emissive: nucleusColor,
      emissiveIntensity: glow(isDimmed, emphasis),
      roughness: 0.3,
    }),
    [nucleusColor, isDimmed, emphasis],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement);
  const scale = emphasis === "raised" ? 1.6 : 1;
  return (
    <group position={[position.x, position.y, 0.1]}>
      <mesh material={material} scale={scale}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      {/* A larger, fully transparent body around the nucleus, so that pointing near the nucleus still picks its language. */}
      <mesh userData={useMemo(() => ({ language: name }), [name])}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group position={[labelOffset.dx, labelOffset.dy, 0.3]}>
        <TextSprite
          text={label}
          secondText={sublabel}
          color={labelColor}
          height={labelHeight}
          anchor={labelOffset}
        />
      </group>
    </group>
  );
}
