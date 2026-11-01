import { BufferGeometry, Float32BufferAttribute } from "three";
import type { SpacePoint } from "../glottometry/paddedHullSurface";

/** Turns rings of surface samples, as returned by paddedHullSurface, into a smooth-shaded closed mesh. */
export function buildBlobGeometry(rings: SpacePoint[][]) {
  const positions = rings.flat().flatMap(({ x, y, z }) => [x, y, z]);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(gridIndices(rings.length, rings[0]?.length ?? 0));
  geometry.computeVertexNormals();
  return geometry;
}

/** Joins each ring to the next with two triangles per segment, wound counterclockwise seen from outside. */
function gridIndices(ringCount: number, ringLength: number) {
  const indices: number[] = [];
  for (let ring = 0; ring < ringCount - 1; ring++) {
    for (let segment = 0; segment < ringLength - 1; segment++) {
      const a = ring * ringLength + segment;
      const b = a + ringLength;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  return indices;
}
