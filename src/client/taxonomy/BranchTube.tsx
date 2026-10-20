import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { CatmullRomCurve3, Curve, Vector3 } from "three";
import type { BranchPath } from "./traceBranchPaths";

type BranchTubeProps = {
  path: BranchPath;
  color: string;
  /** Whether to round off the path's end, where thinner paths fork from it. */
  isCapped: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
};

/**
 * Gives a branch the cross-section of all the leaves it carries, as in the pipe model of tree growth.
 * The trunk is therefore the thickest part, and each fork divides its thickness among its branches.
 */
export function branchRadius(leafCount: number) {
  return 0.02 + 0.03 * Math.sqrt(leafCount);
}

/** Draws a path as a smooth tube that leaves its fork in the direction of the branch below it. */
export function BranchTube({
  path,
  color,
  isCapped,
  onPointerOver,
  onPointerOut,
}: BranchTubeProps) {
  const curve = useMemo(() => toSmoothCurve(path), [path]);
  const radius = branchRadius(path.leafCount);
  const end = path.positions.at(-1);

  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <mesh>
        <tubeGeometry args={[curve, 16 * path.positions.length, radius, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {isCapped && end && (
        <mesh position={end}>
          <sphereGeometry args={[radius, 12, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

function toSmoothCurve({ positions, leadPosition }: BranchPath) {
  const vectors = positions.map((position) => new Vector3(...position));
  if (!leadPosition) return new CatmullRomCurve3(vectors, false, "centripetal");
  const curve = new CatmullRomCurve3(
    [new Vector3(...leadPosition), ...vectors],
    false,
    "centripetal",
  );
  return new CurveTail(curve, 1 / vectors.length);
}

/** The part of a curve after the given fraction of its parameter range. */
class CurveTail extends Curve<Vector3> {
  private readonly curve: Curve<Vector3>;
  private readonly start: number;

  constructor(curve: Curve<Vector3>, start: number) {
    super();
    this.curve = curve;
    this.start = start;
  }

  override getPoint(t: number, target = new Vector3()) {
    return this.curve.getPoint(this.start + t * (1 - this.start), target);
  }
}
