import { BufferGeometry, Float32BufferAttribute } from "three";
import type { SurfaceSample } from "../glottometry/paddedHullSurface";

/** Turns rings of surface samples, as returned by paddedHullSurface, into a closed mesh with the samples' normals. */
export function buildBlobGeometry(rings: SurfaceSample[][]) {
  const samples = rings.flat();
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      samples.flatMap(({ position }) => [position.x, position.y, position.z]),
      3,
    ),
  );
  geometry.setAttribute(
    "normal",
    new Float32BufferAttribute(
      samples.flatMap(({ normal }) => [normal.x, normal.y, normal.z]),
      3,
    ),
  );
  geometry.setIndex(gridIndices(rings.length, rings[0]?.length ?? 0));
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
