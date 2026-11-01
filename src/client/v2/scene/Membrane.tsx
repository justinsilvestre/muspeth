import { useEffect, useMemo } from "react";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { paddedHullSurface } from "../glottometry/paddedHullSurface";
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
};

/** Draws a translucent lens-shaped membrane enclosing some points, thickening toward its edge like a cell wall. */
export function Membrane({ points, padding, color, thickness, order, appearance }: MembraneProps) {
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
      strength: edgeStrength * (0.4 + 0.6 * thickness),
      width: edgeWidth * (0.3 + 0.7 * thickness),
    }),
    [edgeStrength, edgeWidth, thickness],
  );
  const material = useUndulatingMaterial(parameters, appearance.movement, edgeGlow);
  return <mesh geometry={geometry} material={material} renderOrder={order} />;
}
