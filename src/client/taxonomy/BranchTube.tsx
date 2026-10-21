import type { ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useMemo } from "react";
import { CatmullRomCurve3, Curve, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { acceleratedRaycast, MeshBVH } from "three-mesh-bvh";
import { type BranchShape, branchRadiusAt, heightAlongTree, tipTaper } from "./branchRadiusAt";
import { FloatingLeaf, type LeafStyle } from "./FloatingLeaf";
import type { useBarkMaterials } from "./graphics/useBarkMaterials";
import type { BranchPath, Position } from "./traceBranchPaths";
import { offsetStrand, strandRadiusAt } from "./trunkStrand";

const radialSegments = 10;
const tubularSegmentsPerPosition = 8;
/** The radius of the invisible tube that catches the pointer, so even the finest twigs are easy to point at. */
const pointerTargetRadius = 0.1;
/** Rounds off each fork, scaled to the branch's radius there. */
const forkGeometry = new SphereGeometry(1, 12, 8);

type BranchTubeProps = {
  path: BranchPath;
  shape: BranchShape;
  barkMaterials: ReturnType<typeof useBarkMaterials>;
  leafStyle: LeafStyle;
  isHighlighted: boolean;
  /** An image to draw on the leaf, if the path ends at an organism. */
  leafImageUrl?: string;
  /** Receives the path's end ID when the pointer enters the branch, and null when it leaves. */
  onHover: (endId: string | null) => void;
};

/**
 * Draws a path as a smooth, tapering tube that leaves its fork in the direction of the branch below it.
 * A path that rises from the trunk's base is drawn as one strand of the trunk, beside the strands of its sibling branches.
 * A path ending at an organism narrows to a point and carries a floating leaf; a path ending at a fork is rounded off where its branches leave.
 */
export const BranchTube = memo(function BranchTube(props: BranchTubeProps) {
  const { path, shape, barkMaterials, isHighlighted, onHover } = props;
  const endsAtOrganism = path.leafCount === 1;
  const curve = useMemo(() => toSmoothCurve(offsetStrand(path, shape)), [path, shape]);
  const geometry = useMemo(
    () => withBoundsTree(createTaperedTube(curve, path, shape, endsAtOrganism)),
    [curve, path, shape, endsAtOrganism],
  );
  const pointerTarget = useMemo(
    () =>
      withBoundsTree(new TubeGeometry(curve, 4 * path.positions.length, pointerTargetRadius, 6)),
    [curve, path],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => pointerTarget.dispose(), [pointerTarget]);
  const [tip, direction] = useMemo(() => [curve.getPointAt(1), curve.getTangentAt(1)], [curve]);
  const material = isHighlighted ? barkMaterials.highlighted : barkMaterials.plain;

  /** Highlights this branch's lineage for the nearest object under the pointer only. */
  const hover = (endId: string | null) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(endId);
  };

  return (
    <group onPointerOver={hover(path.endId)} onPointerOut={hover(null)}>
      <mesh geometry={geometry} material={material} raycast={acceleratedRaycast} />
      {barkMaterials.outline && (
        <mesh geometry={geometry} material={barkMaterials.outline} raycast={ignoreRaycast} />
      )}
      <mesh geometry={pointerTarget} visible={false} raycast={acceleratedRaycast} />
      {endsAtOrganism ? (
        <FloatingLeaf
          id={path.endId}
          branchTip={tip}
          direction={direction}
          style={props.leafStyle}
          isHighlighted={isHighlighted}
          imageUrl={props.leafImageUrl}
        />
      ) : (
        <mesh
          geometry={forkGeometry}
          material={material}
          position={tip}
          scale={branchRadiusAt(heightAlongTree(tip.toArray()), shape)}
        />
      )}
    </group>
  );
});

/** Indexes a geometry's triangles, so that a ray can be tested against only the few near it. */
function withBoundsTree<T extends TubeGeometry>(geometry: T) {
  geometry.boundsTree = new MeshBVH(geometry);
  return geometry;
}

/** Leaves a mesh out of pointer tests, for one that only repeats another mesh's geometry. */
function ignoreRaycast() {}

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

/** Builds a tube of unit radius, then scales each ring of vertices to the radius at its height along the tree. */
function createTaperedTube(
  curve: Curve<Vector3>,
  path: BranchPath,
  shape: BranchShape,
  endsAtOrganism: boolean,
) {
  const tubularSegments = tubularSegmentsPerPosition * path.positions.length;
  const lastStretch = 1 / (path.positions.length - 1);
  const geometry = new TubeGeometry(curve, tubularSegments, 1, radialSegments);
  const vertices = geometry.getAttribute("position");
  const [center, vertex] = [new Vector3(), new Vector3()];
  for (let ring = 0; ring <= tubularSegments; ring++) {
    // TubeGeometry places its rings at evenly spaced lengths along the curve.
    const along = ring / tubularSegments;
    curve.getPointAt(along, center);
    const taper = endsAtOrganism ? tipTaper(along, lastStretch) : 1;
    const radius = measureRadius(center.toArray(), path, shape) * taper;
    for (let side = 0; side <= radialSegments; side++) {
      const index = ring * (radialSegments + 1) + side;
      vertex.fromBufferAttribute(vertices, index).sub(center).multiplyScalar(radius).add(center);
      vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  return geometry;
}

function measureRadius(center: Position, path: BranchPath, shape: BranchShape) {
  if (!path.trunkDirection) return branchRadiusAt(heightAlongTree(center), shape);
  const endHeight = path.positions.at(-1)?.[1] ?? 0;
  return strandRadiusAt(center, path.trunkDirection, endHeight, shape);
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
