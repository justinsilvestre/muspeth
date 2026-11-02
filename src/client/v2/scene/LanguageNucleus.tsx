import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, MathUtils, type Mesh } from "three";
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

/** How quickly a body's size and glow settle toward their new values after the pointer moves, as a damping rate. */
const settleRate = 14;

/**
 * How far a nucleus moves with the field, as a share of the membranes' drift, and how far ahead of the membranes
 * it runs, so that it seems to stir the membranes rather than ride them. It keeps its shape as it moves.
 */
const nucleusMotion = { rigidShare: 0.35, lead: 0.9 };

/** How brightly a body glows: dim when nothing reaches it, brighter as a member of what the pointer is on. */
function glow(isDimmed: boolean | undefined, emphasis: Emphasis | undefined) {
  if (emphasis === "raised") return 1.6;
  if (emphasis === "muted") return 0.3;
  return isDimmed ? 0.1 : 0.9;
}

/** The colors a raised body's label takes on, so that it lights up with the body, by the background it sits on. */
const raisedLabelColors = { onLight: "#a64600", onDark: "#ff8832" };

function raisedLabelColor(labelColor: string) {
  const isLightBackground = new Color(labelColor).getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
  return isLightBackground ? raisedLabelColors.onLight : raisedLabelColors.onDark;
}

/** Marks one language as a small bright body, with its name floating beside it. */
export function LanguageNucleus(props: LanguageNucleusProps) {
  const { name, label, sublabel, position, labelOffset, labelHeight, labelColor, appearance } =
    props;
  const { isDimmed, emphasis } = props;
  const nucleusColor = appearance.color.nucleus;
  const parameters = useMemo(
    () => ({ color: nucleusColor, emissive: nucleusColor, roughness: 0.3 }),
    [nucleusColor],
  );
  const motion = useMemo(
    () => ({ ...appearance.movement, ...nucleusMotion }),
    [appearance.movement],
  );
  const material = useUndulatingMaterial(parameters, motion);
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const scale = emphasis === "raised" ? 1.6 : 1;
    mesh.scale.setScalar(MathUtils.damp(mesh.scale.x, scale, settleRate, delta));
    const target = glow(isDimmed, emphasis);
    material.emissiveIntensity = MathUtils.damp(
      material.emissiveIntensity,
      target,
      settleRate,
      delta,
    );
  });
  return (
    <group position={[position.x, position.y, 0.1]}>
      <mesh ref={meshRef} material={material}>
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
          color={emphasis === "raised" ? raisedLabelColor(labelColor) : labelColor}
          height={labelHeight}
          anchor={labelOffset}
        />
      </group>
    </group>
  );
}
