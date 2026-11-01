import { useEffect, useMemo } from "react";
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
  isHighlighted?: boolean;
};

/** Draws a translucent lens-shaped membrane enclosing some points, thickening toward its edge like a cell wall. */
export function Membrane(props: MembraneProps) {
  const { points, padding, color, thickness, order, appearance, subgroup, isHighlighted } = props;
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
      color,
      transparent: true,
      opacity: bodyOpacity,
      depthWrite: false,
      ...finishes[finish],
    }),
    [color, bodyOpacity, finish],
  );
  const edgeGlow = useMemo(
    () => ({
      strength: isHighlighted ? 1 : edgeStrength * (0.4 + 0.6 * thickness),
      width: edgeWidth * (0.3 + 0.7 * thickness),
    }),
    [edgeStrength, edgeWidth, thickness, isHighlighted],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement, edgeGlow);
  const userData = useMemo(() => ({ subgroup }), [subgroup]);
  return <mesh geometry={geometry} material={material} renderOrder={order} userData={userData} />;
}
