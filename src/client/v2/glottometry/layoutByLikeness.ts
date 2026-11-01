import type { LanguageLayout, PlanePoint } from "./layoutLanguages";
import type { InnovationTable } from "./parseInnovationsCsv";

/**
 * Places languages on a plane so that languages sharing many innovations lie close together,
 * for families whose geography is unknown. Uses classical multidimensional scaling of the
 * distances between languages, where the distance is the number of innovations one has and the other lacks,
 * then centers and scales the result to span the given extent on its longer axis.
 */
export function layoutByLikeness({ languages, innovations }: InnovationTable, extent: number) {
  const count = languages.length;
  const distances = languages.map((a) =>
    languages.map(
      (b) => innovations.filter(({ members }) => members.has(a) !== members.has(b)).length,
    ),
  );
  const gram = doubleCenter(distances.map((row) => row.map((distance) => distance ** 2)));
  const first = principalAxis(
    gram,
    Array.from({ length: count }, (_, i) => Math.cos(i)),
  );
  const second = principalAxis(
    deflate(gram, first),
    Array.from({ length: count }, (_, i) => Math.sin(i * 1.3)),
  );
  return scaleToExtent(
    languages,
    first.map((x, i) => ({ x, y: second[i] ?? 0 })),
    extent,
  );
}

/** Turns squared distances into inner products about the centroid, as classical scaling requires. */
function doubleCenter(squared: number[][]) {
  const count = squared.length;
  const rowMeans = squared.map((row) => row.reduce((sum, v) => sum + v, 0) / count);
  const grandMean = rowMeans.reduce((sum, v) => sum + v, 0) / count;
  return squared.map((row, i) =>
    row.map((v, j) => -0.5 * (v - (rowMeans[i] ?? 0) - (rowMeans[j] ?? 0) + grandMean)),
  );
}

/** Finds the leading eigenvector of a symmetric matrix by power iteration, scaled by the square root of its eigenvalue. */
function principalAxis(matrix: number[][], start: number[]) {
  let vector = normalize(start);
  let eigenvalue = 0;
  for (let step = 0; step < 200; step++) {
    const next = matrix.map((row) => row.reduce((sum, v, j) => sum + v * (vector[j] ?? 0), 0));
    eigenvalue = Math.hypot(...next);
    if (eigenvalue === 0) break;
    vector = next.map((v) => v / eigenvalue);
  }
  return vector.map((v) => v * Math.sqrt(Math.max(eigenvalue, 0)));
}

/** Removes an axis from a matrix so that the next power iteration finds the following one. */
function deflate(matrix: number[][], axis: number[]) {
  const length = Math.hypot(...axis);
  if (length === 0) return matrix;
  const unit = axis.map((v) => v / length);
  return matrix.map((row, i) =>
    row.map((v, j) => v - length ** 2 * (unit[i] ?? 0) * (unit[j] ?? 0)),
  );
}

function normalize(vector: number[]) {
  const length = Math.hypot(...vector) || 1;
  return vector.map((v) => v / length);
}

function scaleToExtent(languages: string[], points: PlanePoint[], extent: number) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const scale = extent / span;
  const positions = new Map(
    languages.map((name, i) => [
      name,
      { x: ((points[i]?.x ?? 0) - centerX) * scale, y: ((points[i]?.y ?? 0) - centerY) * scale },
    ]),
  );
  return { positions, unitsPerDegree: 0 } satisfies LanguageLayout;
}
