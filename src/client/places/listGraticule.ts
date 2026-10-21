/** The spacings tried for graticule lines, in degrees, from coarsest to finest. */
const stepsDegrees = [30, 10, 5, 1, 0.5, 0.1, 0.05, 0.01];

type Bounds = { west: number; east: number; south: number; north: number };

/**
 * Lists the latitudes and longitudes at which to draw graticule lines inside a region, leaving out its edges.
 * It uses the coarsest spacing that crosses the region's height at least three times.
 */
export function listGraticule({ west, east, south, north }: Bounds) {
  const step = stepsDegrees.find((size) => (north - south) / size >= 3) ?? 0.01;
  return {
    latitudes: listMultiplesWithin(south, north, step),
    longitudes: listMultiplesWithin(west, east, step),
  };
}

/** Names a latitude, such as "35.5°N". */
export function formatLatitude(latitude: number) {
  return formatDegrees(latitude, "N", "S");
}

/** Names a longitude, such as "120°W". */
export function formatLongitude(longitude: number) {
  return formatDegrees(longitude, "E", "W");
}

function listMultiplesWithin(low: number, high: number, step: number) {
  const multiples = [];
  for (let index = Math.floor(low / step) + 1; index * step < high; index++) {
    // Rounding removes floating-point noise such as 35.000000000000004.
    multiples.push(Number((index * step).toFixed(4)));
  }
  return multiples;
}

function formatDegrees(value: number, positive: string, negative: string) {
  const magnitude = Number(Math.abs(value).toFixed(2));
  if (magnitude === 0) return "0°";
  return `${magnitude}°${value > 0 ? positive : negative}`;
}
