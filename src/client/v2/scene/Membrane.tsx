import { useMemo } from "react";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { membraneContour } from "../glottometry/membraneContour";
import { paddedHullSurface } from "../glottometry/paddedHullSurface";
import { buildBlobGeometry } from "./buildBlobGeometry";
import { useUndulatingMaterial } from "./undulation";

/** Blobs are squashed vertically to this share of their padding, giving them a lens-like shape. */
const flattening = 0.45;
const surfaceDetail = { rings: 24, segments: 96 };

type MembraneProps = {
  /** The positions enclosed by the membrane. */
  points: PlanePoint[];
  /** The distance by which the membrane surrounds its points. */
  padding: number;
  /** Radius of the rim tube running around the membrane's equator. */
  rimThickness: number;
  color: string;
  bodyOpacity: number;
  /** Membranes with a higher order are drawn later, so outer membranes should have a higher order than inner ones. */
  order: number;
};

/** Draws a translucent three-dimensional body enclosing some points, with a rim around its widest extent. */
export function Membrane({
  points,
  padding,
  rimThickness,
  color,
  bodyOpacity,
  order,
}: MembraneProps) {
  const body = useMemo(
    () => buildBlobGeometry(paddedHullSurface(points, padding, flattening, surfaceDetail)),
    [points, padding],
  );
  const rim = useMemo(
    () => buildRim(membraneContour(points, padding, surfaceDetail.segments), rimThickness),
    [points, padding, rimThickness],
  );
  const rimMaterial = useUndulatingMaterial({ color, roughness: 0.35, clearcoat: 1 });
  const bodyMaterial = useUndulatingMaterial({
    color,
    transparent: true,
    opacity: bodyOpacity,
    depthWrite: false,
    roughness: 0.25,
    clearcoat: 0.6,
  });
  return (
    <group renderOrder={order}>
      <mesh geometry={rim} material={rimMaterial} renderOrder={order} />
      <mesh geometry={body} material={bodyMaterial} renderOrder={order} />
    </group>
  );
}

function buildRim(contour: PlanePoint[], thickness: number) {
  const curve = new CatmullRomCurve3(
    contour.map(({ x, y }) => new Vector3(x, y, 0)),
    true,
    "centripetal",
  );
  return new TubeGeometry(curve, contour.length * 2, thickness, 10, true);
}
