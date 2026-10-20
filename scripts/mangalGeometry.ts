/** Where a Mangal network was recorded, as GeoJSON with positions given as [longitude, latitude]. */
export type MangalGeometry =
  | { type: "Point"; coordinates: Position }
  | { type: "Polygon"; coordinates: Position[][] };

type Position = [number, number];

/** Reads a GeoJSON point or polygon, or returns null for anything else. */
export function parseGeometry(value: unknown): MangalGeometry | null {
  if (typeof value !== "object" || value === null) return null;
  const { type, coordinates } = value as { type?: unknown; coordinates?: unknown };
  if (type === "Point" && isPosition(coordinates)) return { type, coordinates };
  if (type === "Polygon" && Array.isArray(coordinates) && coordinates.every(isRing)) {
    return { type, coordinates };
  }
  return null;
}

function isRing(value: unknown): value is Position[] {
  return Array.isArray(value) && value.length > 0 && value.every(isPosition);
}

function isPosition(value: unknown): value is Position {
  return Array.isArray(value) && value.length >= 2 && value.slice(0, 2).every(Number.isFinite);
}

/** Gives a point's latitude and longitude, or the centroid of a polygon's outer ring. */
export function toLatitudeLongitude(geometry: MangalGeometry) {
  const [longitude, latitude] =
    geometry.type === "Point"
      ? geometry.coordinates
      : toRingCentroid(geometry.coordinates[0] ?? []);
  return { latitude, longitude };
}

/**
 * Finds the centroid of a ring by the shoelace formula, which weights each part of the ring by
 * the area it encloses. A ring that encloses no area falls back to the mean of its vertices.
 */
function toRingCentroid(ring: Position[]): Position {
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let index = 0; index < ring.length; index++) {
    const [x0, y0] = ring[index] ?? [0, 0];
    const [x1, y1] = ring[(index + 1) % ring.length] ?? [0, 0];
    const cross = x0 * y1 - x1 * y0;
    twiceArea += cross;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  if (twiceArea === 0) return toMeanPosition(ring);
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

function toMeanPosition(ring: Position[]): Position {
  const sum = ring.reduce(([x, y], [px, py]) => [x + px, y + py], [0, 0]);
  return [sum[0] / ring.length, sum[1] / ring.length];
}
