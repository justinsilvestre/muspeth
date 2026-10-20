import { useMemo } from "react";
import { DoubleSide, Quaternion, Shape, ShapeGeometry, Vector3 } from "three";
import { hashToUnit } from "./hashToUnit";

const leafLength = 0.32;
const leafWidth = 0.13;

/** A flat, pointed oval, with its stem end at the origin and its tip along +Y. */
const leafGeometry = new ShapeGeometry(
  new Shape()
    .moveTo(0, 0)
    .quadraticCurveTo(leafWidth, leafLength * 0.4, 0, leafLength)
    .quadraticCurveTo(-leafWidth, leafLength * 0.4, 0, 0),
  12,
);

const up = new Vector3(0, 1, 0);

type FloatingLeafProps = {
  id: string;
  branchTip: Vector3;
  /** The unit direction the branch is heading at its tip. */
  direction: Vector3;
  color: string;
  /** A multiple of the leaf's standard size. */
  size: number;
  /** The space between the branch tip and the leaf's stem end. */
  gap: number;
};

/** Draws a leaf that continues the branch's direction, held just apart from its tip. */
export function FloatingLeaf({ id, branchTip, direction, color, size, gap }: FloatingLeafProps) {
  const [position, quaternion] = useMemo(() => {
    const along = new Quaternion().setFromUnitVectors(up, direction);
    // Each leaf turns to its own fixed angle around its stem, so the leaves don't all face one way.
    const roll = new Quaternion().setFromAxisAngle(up, hashToUnit(id, "leafRoll") * Math.PI);
    return [branchTip.clone().addScaledVector(direction, gap), along.multiply(roll)];
  }, [id, branchTip, direction, gap]);

  return (
    <mesh geometry={leafGeometry} position={position} quaternion={quaternion} scale={size}>
      <meshStandardMaterial color={color} side={DoubleSide} roughness={0.6} />
    </mesh>
  );
}
