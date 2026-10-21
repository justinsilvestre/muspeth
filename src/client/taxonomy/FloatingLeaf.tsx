import { useMemo } from "react";
import { DoubleSide, Quaternion, Shape, ShapeGeometry, Vector3 } from "three";
import { hashToUnit } from "./hashToUnit";
import type { useLeafMaterials } from "./useLeafMaterials";
import { useSquareTexture } from "./useSquareTexture";

const plainLeafGeometry = createLeafGeometry(0.13, 0.32);
/** A broader, longer leaf, so that more of the image it carries shows. */
const imageLeafGeometry = createLeafGeometry(0.34, 0.4);

const up = new Vector3(0, 1, 0);
/** How much a highlighted image leaf grows, since a tint alone is hard to see on a photograph. */
const highlightGrowth = 1.3;

/** How every leaf in the tree looks, apart from its highlight and its image. */
export type LeafStyle = {
  materials: ReturnType<typeof useLeafMaterials>;
  /** A multiple of the leaf's standard size. */
  size: number;
  /** The space between the branch tip and the leaf's stem end. */
  gap: number;
};

type FloatingLeafProps = {
  id: string;
  branchTip: Vector3;
  /** The unit direction the branch is heading at its tip. */
  direction: Vector3;
  style: LeafStyle;
  isHighlighted: boolean;
  /** An image to draw on the leaf in place of its color. */
  imageUrl?: string;
};

/**
 * Draws a leaf that continues the branch's direction, held just apart from its tip.
 * A leaf given an image shows it once it loads, and is plain until then or if it fails to load.
 */
export function FloatingLeaf(props: FloatingLeafProps) {
  const { id, branchTip, direction, style, isHighlighted } = props;
  const { materials, size, gap } = style;
  const texture = useSquareTexture(props.imageUrl);
  const [position, quaternion] = useMemo(() => {
    const along = new Quaternion().setFromUnitVectors(up, direction);
    // Each leaf turns to its own fixed angle around its stem, so the leaves don't all face one way.
    const roll = new Quaternion().setFromAxisAngle(up, hashToUnit(id, "leafRoll") * Math.PI);
    return [branchTip.clone().addScaledVector(direction, gap), along.multiply(roll)];
  }, [id, branchTip, direction, gap]);

  if (!texture) {
    return (
      <mesh
        geometry={plainLeafGeometry}
        material={isHighlighted ? materials.highlighted : materials.plain}
        position={position}
        quaternion={quaternion}
        scale={size}
      />
    );
  }
  // A new key gives the image leaf its own material, since three.js compiles a material's shader once, before it has a map.
  return (
    <mesh
      key="image"
      geometry={imageLeafGeometry}
      position={position}
      quaternion={quaternion}
      scale={isHighlighted ? size * highlightGrowth : size}
    >
      <meshStandardMaterial
        map={texture}
        side={DoubleSide}
        roughness={0.8}
        emissive={materials.highlightColor}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      />
    </mesh>
  );
}

/**
 * Builds a flat, pointed oval, with its stem end at the origin and its tip along +Y.
 * Its texture coordinates map a square image onto the leaf's length, centered across its width.
 */
function createLeafGeometry(width: number, length: number) {
  const geometry = new ShapeGeometry(
    new Shape()
      .moveTo(0, 0)
      .quadraticCurveTo(width, length * 0.4, 0, length)
      .quadraticCurveTo(-width, length * 0.4, 0, 0),
    12,
  );
  const [positions, uvs] = [geometry.getAttribute("position"), geometry.getAttribute("uv")];
  for (let index = 0; index < positions.count; index++) {
    uvs.setXY(index, 0.5 + positions.getX(index) / length, positions.getY(index) / length);
  }
  return geometry;
}
