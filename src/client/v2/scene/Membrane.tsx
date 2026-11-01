import { useMemo } from "react";
import { CatmullRomCurve3, Shape, TubeGeometry, Vector3 } from "three";
import type { PlanePoint } from "../glottometry/layoutLanguages";
import { useUndulatingMaterial } from "./undulation";

type MembraneProps = {
  contour: PlanePoint[];
  /** Radius of the membrane's tube. */
  thickness: number;
  color: string;
  /** Opacity of the translucent body enclosed by the membrane. */
  fillOpacity: number;
  z: number;
};

/** Draws a closed membrane around a region of the diagram, as a tube enclosing a translucent body. */
export function Membrane({ contour, thickness, color, fillOpacity, z }: MembraneProps) {
  const tube = useMemo(() => buildTube(contour, thickness), [contour, thickness]);
  const shape = useMemo(() => buildShape(contour), [contour]);
  const skin = useUndulatingMaterial({ color, roughness: 0.35, clearcoat: 1 });
  const body = useUndulatingMaterial({
    color,
    transparent: true,
    opacity: fillOpacity,
    depthWrite: false,
    roughness: 0.9,
  });
  return (
    <group position-z={z}>
      <mesh geometry={tube} material={skin} />
      <mesh material={body} position-z={-thickness}>
        <shapeGeometry args={[shape, 24]} />
      </mesh>
    </group>
  );
}

function buildTube(contour: PlanePoint[], thickness: number) {
  const curve = new CatmullRomCurve3(
    contour.map(({ x, y }) => new Vector3(x, y, 0)),
    true,
    "centripetal",
  );
  return new TubeGeometry(curve, contour.length * 2, thickness, 10, true);
}

function buildShape(contour: PlanePoint[]) {
  const shape = new Shape();
  const [first = { x: 0, y: 0 }, ...rest] = contour;
  shape.moveTo(first.x, first.y);
  for (const { x, y } of rest) shape.lineTo(x, y);
  shape.closePath();
  return shape;
}
