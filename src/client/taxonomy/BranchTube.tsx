import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { QuadraticBezierCurve3, Vector3 } from "three";
import type { layoutTaxonTree } from "./layoutTaxonTree";

type BranchTubeProps = {
  branch: ReturnType<typeof layoutTaxonTree>["branches"][number];
  isHighlighted: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
};

/** Draws a branch that leaves its parent outward and bends upward toward its child, thinning with depth. */
export function BranchTube({
  branch,
  isHighlighted,
  onPointerOver,
  onPointerOut,
}: BranchTubeProps) {
  const curve = useMemo(() => {
    const from = new Vector3(...branch.from);
    const to = new Vector3(...branch.to);
    const bend = new Vector3(
      from.x + (to.x - from.x) * 0.8,
      from.y + (to.y - from.y) * 0.2,
      from.z + (to.z - from.z) * 0.8,
    );
    return new QuadraticBezierCurve3(from, bend, to);
  }, [branch]);

  return (
    <mesh onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <tubeGeometry args={[curve, 24, 0.1 * 0.8 ** branch.depth, 8]} />
      <meshStandardMaterial color={isHighlighted ? "#a8714a" : "#6b4f3a"} roughness={0.9} />
    </mesh>
  );
}
