import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CatmullRomCurve3, Curve, TubeGeometry, Vector3 } from "three";
import type { BranchPath } from "./traceBranchPaths";

const radiusAtRoot = 0.3;
/** How much thinner the tree gets with each rank, as a fraction of the rank below. */
const taperPerRank = 0.75;
const radialSegments = 12;

type BranchTubeProps = {
  path: BranchPath;
  color: string;
  /** Whether to round off the path's end, where thinner paths fork from it. */
  isCapped: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
};

/**
 * Returns the branch radius at the given height, measured in ranks above the root.
 * The tree thins by the same fraction with each rank, so it flares below the root and branches meet seamlessly at forks.
 */
export function branchRadiusAt(height: number) {
  return radiusAtRoot * taperPerRank ** height;
}

/** Draws a path as a smooth, tapering tube that leaves its fork in the direction of the branch below it. */
export function BranchTube({
  path,
  color,
  isCapped,
  onPointerOver,
  onPointerOut,
}: BranchTubeProps) {
  const geometry = useMemo(() => createTaperedTube(toSmoothCurve(path), path), [path]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const end = path.positions.at(-1);

  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {isCapped && end && (
        <mesh position={end}>
          <sphereGeometry args={[branchRadiusAt(end[1]), 12, 8]} />
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

/** Builds a tube of unit radius, then scales each ring of vertices to the radius at its height. */
function createTaperedTube(curve: Curve<Vector3>, path: BranchPath) {
  const tubularSegments = 16 * path.positions.length;
  const geometry = new TubeGeometry(curve, tubularSegments, 1, radialSegments);
  const vertices = geometry.getAttribute("position");
  const [center, vertex] = [new Vector3(), new Vector3()];
  for (let ring = 0; ring <= tubularSegments; ring++) {
    // TubeGeometry places its rings at evenly spaced lengths along the curve.
    curve.getPointAt(ring / tubularSegments, center);
    const radius = branchRadiusAt(center.y);
    for (let side = 0; side <= radialSegments; side++) {
      const index = ring * (radialSegments + 1) + side;
      vertex.fromBufferAttribute(vertices, index).sub(center).multiplyScalar(radius).add(center);
      vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  return geometry;
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
