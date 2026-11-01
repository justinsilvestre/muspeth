import { useMemo } from "react";
import { DoubleSide } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { paddedHullSurface } from "../glottometry/paddedHullSurface";
import { buildBlobGeometry } from "./buildBlobGeometry";
import { useUndulatingMaterial } from "./undulation";

/** Membranes are squashed vertically to this share of their padding, giving them a lens-like shape. */
const flattening = 0.45;
const surfaceDetail = { rings: 32, segments: 128 };

type MembraneProps = {
  /** The positions enclosed by the membrane. */
  points: PlanePoint[];
  /** The distance by which the membrane surrounds its points. */
  padding: number;
  color: string;
  /** How opaque the membrane is where it faces the viewer. */
  bodyOpacity: number;
  /** How far the membrane's edge-on thickening reaches in from its silhouette, from 0 to 1. */
  thickness: number;
  /** Membranes with a higher order are drawn later, so outer membranes should have a higher order than inner ones. */
  order: number;
};

/** Draws a translucent lens-shaped membrane enclosing some points, thickening toward its edge like a cell wall. */
export function Membrane({ points, padding, color, bodyOpacity, thickness, order }: MembraneProps) {
  const geometry = useMemo(
    () => buildBlobGeometry(paddedHullSurface(points, padding, flattening, surfaceDetail)),
    [points, padding],
  );
  const material = useUndulatingMaterial(
    {
      color,
      transparent: true,
      opacity: bodyOpacity,
      depthWrite: false,
      side: DoubleSide,
      roughness: 0.4,
      clearcoat: 0.5,
    },
    { strength: 0.5 + 0.5 * thickness, width: 0.2 + 0.6 * thickness },
  );
  return <mesh geometry={geometry} material={material} renderOrder={order} />;
}
