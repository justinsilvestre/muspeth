import { BufferAttribute, BufferGeometry } from "three";
import type { SampledSurface } from "../glottometry/paddedHullSurface";

/** Turns a sampled surface, as returned by paddedHullSurface, into a closed mesh with the samples' normals. */
export function buildBlobGeometry({ rings, segments, positions, normals }: SampledSurface) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setIndex(gridIndices(rings + 1, segments + 1));
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
