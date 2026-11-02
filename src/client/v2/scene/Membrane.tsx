import { useEffect, useMemo } from "react";
import { Color } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { paddedHullSurface } from "../glottometry/paddedHullSurface";
import type { Subgroup } from "../glottometry/scoreSubgroups";
import { type Appearance, finishes } from "./appearance";
import { buildBlobGeometry } from "./buildBlobGeometry";
import { useUndulatingMaterial } from "./undulation";

const surfaceDetail = { rings: 24, segments: 96 };

type MembraneProps = {
  /** The positions enclosed by the membrane. */
  points: PlanePoint[];
  /** The distance by which the membrane surrounds its points. */
  padding: number;
  color: string;
  /** How strongly the membrane thickens toward its edge, from 0 to 1, relative to the appearance's edge settings. */
  thickness: number;
  /** Membranes with a higher order are drawn later, so outer membranes should have a higher order than inner ones. */
  order: number;
  appearance: Appearance;
  /** The subgroup the membrane stands for, if any, so that pointing at the membrane can name it. */
  subgroup?: Subgroup;
  /** Raised, the membrane stands out from the others; muted, it recedes so that a raised one stands out. */
  emphasis?: Emphasis;
  /** How far the membrane has faded in, from 0 (invisible) to 1; fully in when left out. */
  fade?: number;
};

export type Emphasis = "raised" | "muted";

/** Draws a translucent lens-shaped membrane enclosing some points, thickening toward its edge like a cell wall. */
export function Membrane(props: MembraneProps) {
  const { points, padding, color, thickness, order, appearance, subgroup, emphasis } = props;
  const fade = props.fade ?? 1;
  const { depth, cornerSharpness } = appearance.shape;
  const { bodyOpacity, edgeStrength, edgeWidth, finish } = appearance.material;
  const geometry = useMemo(
    () =>
      buildBlobGeometry(
        paddedHullSurface(points, { padding, flattening: depth, cornerSharpness }, surfaceDetail),
      ),
    [points, padding, depth, cornerSharpness],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  const parameters = useMemo(
    () => ({
      color: emphasis === "raised" ? lighten(color) : color,
      transparent: true,
      opacity: fade * emphasize(bodyOpacity, emphasis),
      depthWrite: false,
      ...finishes[finish],
    }),
    [color, bodyOpacity, finish, emphasis, fade],
  );
  // A thicker wall shows mainly as a stronger, paler rim; the rim reaches only a little further in,
  // so that the membrane as a whole stays about as clear. The thickest walls gain a faint second band inside the rim.
  const edgeGlow = useMemo(
    () => ({
      strength:
        fade *
        (emphasis === "raised" ? 1 : emphasize(edgeStrength * (0.15 + 0.85 * thickness), emphasis)),
      width: edgeWidth * (0.55 + 0.45 * thickness),
      light: 0.55 * thickness,
      innerWall: fade * emphasize(edgeStrength * 0.75 * innerWallShare(thickness), emphasis),
    }),
    [edgeStrength, edgeWidth, thickness, emphasis, fade],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement, edgeGlow);
  const userData = useMemo(() => ({ subgroup }), [subgroup]);
  return <mesh geometry={geometry} material={material} renderOrder={order} userData={userData} />;
}

/** How much of an inner wall a membrane gets by its thickness: none below the middle, rising to full at the thickest. */
function innerWallShare(thickness: number) {
  const share = Math.max(0, (thickness - 0.5) * 2);
  return share * share;
}

/** A raised membrane is a good deal more opaque, and a muted one somewhat fainter, than it would be on its own. */
function emphasize(value: number, emphasis: Emphasis | undefined) {
  if (emphasis === "raised") return Math.min(value + 0.2, 0.7);
  if (emphasis === "muted") return value * 0.6;
  return value;
}

function lighten(color: string) {
  return `#${new Color(color).lerp(new Color("#ffffff"), 0.3).getHexString()}`;
}
